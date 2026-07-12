import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Clinic } from '../models/clinic.model.js';
import { User } from '../models/user.model.js';
import { Appointment } from '../models/appointment.model.js';
import { Patient } from '../models/patient.model.js';
import { Billing } from '../models/billing.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ErrorHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : value);
const normalizeOwnershipType = (value) => String(value || '').trim().toLowerCase();
const isAdminOrSuperAdmin = (user) => ['admin', 'superAdmin'].includes(user?.role);
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.refreshToken;
  return userObject;
};

const defaultClinicSettings = () => ({
  appointment_duration: 30,
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  language: 'en',
  notification_preferences: {
    email: true,
    sms: true,
    push: true,
  },
  working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  clinic_timings: {
    start_time: '09:00',
    end_time: '18:00',
  },
});

const getClinicAccessPolicy = (req, clinicId) => {
  if (!req.user) {
    return false;
  }

  if (isAdminOrSuperAdmin(req.user)) {
    return true;
  }

  return req.user.clinic_id?.toString() === clinicId?.toString();
};

const uploadToCloudinary = async (filePath, folder = 'cms/clinics') => {
  if (!filePath) {
    throw new ApiError(400, 'File path is required for upload');
  }

  try {
    return await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'image',
    });
  } catch (error) {
    throw new ApiError(500, 'Cloudinary upload failed', [error.message]);
  }
};

const deleteCloudinaryResource = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new ApiError(500, 'Failed to delete previous logo from Cloudinary', [error.message]);
  }
};

const getClinicQueryFilter = (reqQuery = {}) => {
  const filter = { is_deleted: false };

  if (reqQuery.search) {
    filter.name = new RegExp(reqQuery.search, 'i');
  }

  if (reqQuery.city) {
    filter.city = new RegExp(`^${reqQuery.city}$`, 'i');
  }

  if (reqQuery.state) {
    filter.state = new RegExp(`^${reqQuery.state}$`, 'i');
  }

  if (reqQuery.country) {
    filter.country = new RegExp(`^${reqQuery.country}$`, 'i');
  }

  if (reqQuery.ownership_type) {
    filter.ownership_type = normalizeOwnershipType(reqQuery.ownership_type);
  }

  if (reqQuery.is_active !== undefined) {
    filter.is_active = reqQuery.is_active === 'true' || reqQuery.is_active === true;
  }

  return filter;
};

const getSortObject = (reqQuery = {}) => {
  const sortField = reqQuery.sort_by || 'createdAt';
  const sortOrder = reqQuery.sort_order === 'asc' ? 1 : -1;

  return { [sortField]: sortOrder };
};


export const registerClinic = asyncHandler(async (req, res) => {
  const {
    name,
    registration_number,
    gst_number,
    address1,
    address2,
    city,
    state,
    country,
    pin_code,
    ownership_type,
    country_code,
    contact_number,
    owner_id,
    owner,
    owner_first_name,
    owner_last_name,
    owner_username,
    owner_email,
    owner_password,
    owner_contact_number,
    owner_country_code,
    role,
  } = req.body;

  const requiredClinicFields = {
    name,
    registration_number,
    gst_number,
    address1,
    city,
    state,
    country,
    pin_code,
    ownership_type,
    country_code,
    contact_number,
  };

  const requiredFieldEntries = Object.entries(requiredClinicFields).filter(([, value]) => !value);

  if (requiredFieldEntries.length) {
    throw new ApiError(400, 'Clinic details are incomplete');
  }

  const normalizedName = normalizeText(name).toLowerCase();
  const normalizedRegistrationNumber = normalizeText(registration_number).toUpperCase();
  const normalizedGstNumber = normalizeText(gst_number).toUpperCase();
  const normalizedCountryCode = normalizeText(country_code);
  const normalizedContactNumber = normalizeText(contact_number);
  const normalizedOwnershipType = normalizeOwnershipType(ownership_type);

  if (!['private', 'government'].includes(normalizedOwnershipType)) {
    throw new ApiError(400, 'ownership_type should be either private or government');
  }

  const clinicConflict = await Clinic.findOne({
    $or: [
      { name: normalizedName },
      { registration_number: normalizedRegistrationNumber },
      { gst_number: normalizedGstNumber },
    ],
  }).lean();

  if (clinicConflict) {
    throw new ApiError(409, 'Clinic with the same name, registration number, or GST already exists');
  }

  const ownerIdentifier = owner_id || owner;

  let ownerUser = null;

  if (ownerIdentifier) {
    ownerUser = await User.findById(ownerIdentifier);

    if (!ownerUser) {
      throw new ApiError(404, 'Owner user not found');
    }
  } else {
    if (!owner_first_name || !owner_username || !owner_email || !owner_password) {
      throw new ApiError(400, 'Owner first name, username, email, and password are required');
    }

    const normalizedUsername = normalizeText(owner_username).toLowerCase();
    const normalizedEmail = normalizeText(owner_email).toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    }).lean();

    if (existingUser) {
      throw new ApiError(409, 'Owner username or email already exists');
    }

    ownerUser = await User.create({
      first_name: normalizeText(owner_first_name),
      last_name: normalizeText(owner_last_name) || '',
      username: normalizedUsername,
      email: normalizedEmail,
      password: owner_password,
      contact_number: normalizeText(owner_contact_number) || normalizedContactNumber,
      country_code: normalizeText(owner_country_code) || normalizedCountryCode,
      role: ['admin', 'superAdmin'].includes(role) ? role : 'admin',
      clinic_id: null,
      is_active: true,
      last_login: new Date(),
    });
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const clinicPayload = {
        name: normalizeText(name),
        registration_number: normalizedRegistrationNumber,
        gst_number: normalizedGstNumber,
        address1: normalizeText(address1),
        address2: normalizeText(address2) || '',
        city: normalizeText(city),
        state: normalizeText(state),
        country: normalizeText(country),
        pin_code: normalizeText(pin_code),
        owner: ownerUser._id,
        ownership_type: normalizedOwnershipType,
        country_code: normalizedCountryCode,
        contact_number: normalizedContactNumber,
        settings: defaultClinicSettings(),
        is_active: true,
        is_deleted: false,
      };

      if (req.file?.path) {
        const uploadedLogo = await uploadToCloudinary(req.file.path, 'cms/clinics');
        clinicPayload.logo = uploadedLogo.secure_url;
        clinicPayload.logo_public_id = uploadedLogo.public_id;
      }

      const [newClinic] = await Clinic.create([clinicPayload], { session });

      ownerUser.clinic_id = newClinic._id;
      ownerUser.role = ['admin', 'superAdmin'].includes(ownerUser.role) ? ownerUser.role : 'admin';
      await ownerUser.save({ session, validateBeforeSave: false });

      const ownerSummary = sanitizeUser(ownerUser);
      res.status(201).json(
        new ApiResponse(
          201,
          {
            clinic: newClinic,
            owner: ownerSummary,
          },
          'Clinic registered successfully'
        )
      );
    });
  } finally {
    await session.endSession();
  }
});


export const getClinicById = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (req.user && !getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot access this clinic');
  }

  const clinic = await Clinic.findById(clinicId)
    .populate('owner', 'first_name last_name username email role contact_number country_code')
    .lean();

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic fetched successfully'));
});


export const getMyClinic = asyncHandler(async (req, res) => {
  if (!req.user?.clinic_id) {
    throw new ApiError(404, 'Current user is not attached to any clinic');
  }

  const clinic = await Clinic.findById(req.user.clinic_id)
    .populate('owner', 'first_name last_name username email role contact_number country_code')
    .lean();

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found for current user');
  }

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic fetched successfully'));
});


export const getAllClinics = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const filter = getClinicQueryFilter(req.query);
  const sortObject = getSortObject(req.query);

  const [clinics, totalRecords] = await Promise.all([
    Clinic.find(filter)
      .select('name registration_number gst_number city state country ownership_type is_active logo settings createdAt updatedAt')
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean(),
    Clinic.countDocuments(filter),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clinics,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit),
        },
      },
      'Clinics fetched successfully'
    )
  );
});


export const updateClinic = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot update this clinic');
  }

  const allowedUpdates = [
    'name',
    'registration_number',
    'gst_number',
    'address1',
    'address2',
    'city',
    'state',
    'country',
    'pin_code',
    'ownership_type',
    'country_code',
    'contact_number',
    'settings',
  ];

  const updatePayload = {};

  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updatePayload[field] = req.body[field];
    }
  }

  if (!Object.keys(updatePayload).length) {
    throw new ApiError(400, 'No clinic fields were provided for update');
  }

  if (updatePayload.ownership_type) {
    updatePayload.ownership_type = normalizeOwnershipType(updatePayload.ownership_type);
  }

  if (updatePayload.registration_number) {
    updatePayload.registration_number = normalizeText(updatePayload.registration_number).toUpperCase();
  }

  if (updatePayload.gst_number) {
    updatePayload.gst_number = normalizeText(updatePayload.gst_number).toUpperCase();
  }

  if (updatePayload.name) {
    updatePayload.name = normalizeText(updatePayload.name);
  }

  if (updatePayload.address1) {
    updatePayload.address1 = normalizeText(updatePayload.address1);
  }

  if (updatePayload.address2) {
    updatePayload.address2 = normalizeText(updatePayload.address2) || '';
  }

  const duplicateClinic = await Clinic.findOne({
    _id: { $ne: clinicId },
    $or: [
      ...(updatePayload.registration_number ? [{ registration_number: updatePayload.registration_number }] : []),
      ...(updatePayload.gst_number ? [{ gst_number: updatePayload.gst_number }] : []),
      ...(updatePayload.name ? [{ name: updatePayload.name.toLowerCase() }] : []),
    ],
  }).lean();

  if (duplicateClinic) {
    throw new ApiError(409, 'Another clinic already exists with the same identifying details');
  }

  const clinic = await Clinic.findByIdAndUpdate(clinicId, updatePayload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic updated successfully'));
});


export const updateClinicLogo = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot update this clinic logo');
  }

  if (!req.file?.path) {
    throw new ApiError(400, 'Clinic logo file is required');
  }

  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  const uploadedImage = await uploadToCloudinary(req.file.path, 'cms/clinics');

  await deleteCloudinaryResource(clinic.logo_public_id);

  clinic.logo = uploadedImage.secure_url;
  clinic.logo_public_id = uploadedImage.public_id;
  await clinic.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic logo updated successfully'));
});


export const updateClinicStatus = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;
  const { is_active } = req.body;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!isAdminOrSuperAdmin(req.user)) {
    throw new ApiError(403, 'Only admins and super admins can update clinic status');
  }

  if (typeof is_active !== 'boolean') {
    throw new ApiError(400, 'is_active must be a boolean value');
  }

  const clinic = await Clinic.findByIdAndUpdate(
    clinicId,
    {
      is_active,
      is_deleted: !is_active,
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic status updated successfully'));
});


export const deleteClinic = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;
  const deactivateUsers = req.query.deactivate_users === 'true';

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!isAdminOrSuperAdmin(req.user)) {
    throw new ApiError(403, 'Only admins and super admins can delete clinics');
  }

  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  if (clinic.is_deleted) {
    throw new ApiError(400, 'Clinic is already soft deleted');
  }

  clinic.is_deleted = true;
  clinic.is_active = false;
  clinic.deleted_at = new Date();
  await clinic.save({ validateBeforeSave: false });

  if (deactivateUsers) {
    await User.updateMany({ clinic_id: clinicId }, { is_active: false });
  }

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic deleted successfully'));
});


export const restoreClinic = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!isAdminOrSuperAdmin(req.user)) {
    throw new ApiError(403, 'Only admins and super admins can restore clinics');
  }

  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  clinic.is_deleted = false;
  clinic.is_active = true;
  clinic.deleted_at = null;
  await clinic.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic restored successfully'));
});

/**
 * @description Return clinic dashboard statistics such as doctors, staff, patients, appointments, and active users.
 */
export const getClinicStats = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot access clinic statistics');
  }

  const [totalDoctors, totalStaff, totalPatients, totalAppointments, activeUsers] = await Promise.all([
    User.countDocuments({ clinic_id: clinicId, role: 'doctor' }),
    User.countDocuments({ clinic_id: clinicId, role: 'staff' }),
    Patient.countDocuments({ clinic_id: clinicId }),
    Appointment.countDocuments({ clinic_id: clinicId }),
    User.countDocuments({ clinic_id: clinicId, is_active: true }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clinicId,
        totalDoctors,
        totalStaff,
        totalPatients,
        totalAppointments,
        activeUsers,
      },
      'Clinic dashboard statistics fetched successfully'
    )
  );
});


export const getClinicAnalytics = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot access clinic analytics');
  }

  const monthlyPatientGrowth = await Patient.aggregate([
    { $match: { clinic_id: new mongoose.Types.ObjectId(clinicId) } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: '$_id', count: 1 } },
  ]);

  const appointmentTrends = await Appointment.aggregate([
    { $match: { clinic_id: new mongoose.Types.ObjectId(clinicId) } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$appointment_date' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: '$_id', count: 1 } },
  ]);

  const revenueSummary = await Billing.aggregate([
    { $match: { clinic_id: new mongoose.Types.ObjectId(clinicId), payment_status: 'paid' } },
    { $group: { _id: null, totalRevenue: { $sum: '$net_amount' } } },
  ]);

  const [doctorCount, patientCount] = await Promise.all([
    User.countDocuments({ clinic_id: clinicId, role: 'doctor' }),
    Patient.countDocuments({ clinic_id: clinicId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clinicId,
        monthlyPatientGrowth,
        appointmentTrends,
        revenue: revenueSummary[0]?.totalRevenue || 0,
        doctorCount,
        patientCount,
      },
      'Clinic analytics fetched successfully'
    )
  );
});


export const checkClinicAvailability = asyncHandler(async (req, res) => {
  const payload = {
    name: req.query.name || req.body.name,
    registration_number: req.query.registration_number || req.body.registration_number,
    gst_number: req.query.gst_number || req.body.gst_number,
    username: req.query.username || req.body.username,
    email: req.query.email || req.body.email,
  };

  if (!Object.values(payload).some(Boolean)) {
    throw new ApiError(400, 'At least one availability field is required');
  }

  const clinicQuery = [];
  const userQuery = [];

  if (payload.name) {
    clinicQuery.push({ name: normalizeText(payload.name).toLowerCase() });
  }

  if (payload.registration_number) {
    clinicQuery.push({ registration_number: normalizeText(payload.registration_number).toUpperCase() });
  }

  if (payload.gst_number) {
    clinicQuery.push({ gst_number: normalizeText(payload.gst_number).toUpperCase() });
  }

  if (payload.username) {
    userQuery.push({ username: normalizeText(payload.username).toLowerCase() });
  }

  if (payload.email) {
    userQuery.push({ email: normalizeText(payload.email).toLowerCase() });
  }

  const [clinicConflict, userConflict] = await Promise.all([
    clinicQuery.length ? Clinic.findOne({ $or: clinicQuery }).select('_id name registration_number gst_number').lean() : null,
    userQuery.length ? User.findOne({ $or: userQuery }).select('_id username email').lean() : null,
  ]);

  const conflicts = [];

  if (clinicConflict) {
    conflicts.push({ entity: 'clinic', details: clinicConflict });
  }

  if (userConflict) {
    conflicts.push({ entity: 'user', details: userConflict });
  }

  return res.status(200).json(
    new ApiResponse(200, { available: conflicts.length === 0, conflicts }, 'Availability check completed successfully')
  );
});


export const updateClinicSettings = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot update clinic settings');
  }

  const clinic = await Clinic.findById(clinicId);

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  clinic.settings = {
    ...defaultClinicSettings(),
    ...(clinic.settings || {}),
    ...req.body,
  };

  await clinic.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { clinic }, 'Clinic settings updated successfully'));
});


export const getClinicSettings = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;

  if (!isValidObjectId(clinicId)) {
    throw new ApiError(400, 'Valid clinic ID is required');
  }

  if (!getClinicAccessPolicy(req, clinicId)) {
    throw new ApiError(403, 'Forbidden: you cannot view clinic settings');
  }

  const clinic = await Clinic.findById(clinicId).select('settings').lean();

  if (!clinic) {
    throw new ApiError(404, 'Clinic not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { settings: clinic.settings || defaultClinicSettings() }, 'Clinic settings fetched successfully')
  );
});


export const transferClinicOwnership = asyncHandler(async (req, res) => {
  const { clinicId } = req.params;
  const { current_owner_id, new_owner_id } = req.body;

  if (!isValidObjectId(clinicId) || !isValidObjectId(current_owner_id) || !isValidObjectId(new_owner_id)) {
    throw new ApiError(400, 'Valid clinic ID, current owner ID, and new owner ID are required');
  }

  if (!isAdminOrSuperAdmin(req.user)) {
    throw new ApiError(403, 'Only admins and super admins can transfer clinic ownership');
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const clinic = await Clinic.findById(clinicId).session(session);

      if (!clinic) {
        throw new ApiError(404, 'Clinic not found');
      }

      if (clinic.owner.toString() !== current_owner_id) {
        throw new ApiError(400, 'Current owner ID does not match the clinic owner');
      }

      const currentOwner = await User.findById(current_owner_id).session(session);
      const newOwner = await User.findById(new_owner_id).session(session);

      if (!currentOwner || !newOwner) {
        throw new ApiError(404, 'Current owner and new owner must both exist');
      }

      if (!['admin', 'superAdmin'].includes(newOwner.role)) {
        newOwner.role = 'admin';
      }

      currentOwner.role = currentOwner.role === 'superAdmin' ? 'admin' : 'staff';
      currentOwner.clinic_id = clinicId;
      newOwner.clinic_id = clinicId;
      clinic.owner = newOwner._id;

      await Promise.all([
        currentOwner.save({ session, validateBeforeSave: false }),
        newOwner.save({ session, validateBeforeSave: false }),
        clinic.save({ session, validateBeforeSave: false }),
      ]);

      return res.status(200).json(
        new ApiResponse(200, { clinic, currentOwner: sanitizeUser(currentOwner), newOwner: sanitizeUser(newOwner) }, 'Clinic ownership transferred successfully')
      );
    });
  } finally {
    await session.endSession();
  }
});
