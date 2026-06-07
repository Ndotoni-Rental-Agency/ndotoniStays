'use client';

import { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { UpdateUserInput } from '@/API';
import { AuthModal } from '@/components/auth/AuthModal';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { UserCircleIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  whatsappNumber: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  nationalId: string;
  address: string;
  region: string;
  district: string;
  ward: string;
  street: string;
  city: string;
}

function createFormDataFromUser(user: UserProfile | null): ProfileFormData {
  if (!user) {
    return {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      whatsappNumber: '',
      dateOfBirth: '',
      gender: '',
      occupation: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      nationalId: '',
      address: '',
      region: '',
      district: '',
      ward: '',
      street: '',
      city: '',
    };
  }
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    phoneNumber: user.phoneNumber || '',
    whatsappNumber: user.whatsappNumber || '',
    dateOfBirth: user.dateOfBirth || '',
    gender: user.gender || '',
    occupation: user.occupation || '',
    emergencyContactName: user.emergencyContactName || '',
    emergencyContactPhone: user.emergencyContactPhone || '',
    nationalId: '',
    address: user.address || '',
    region: user.region || '',
    district: user.district || '',
    ward: user.ward || '',
    street: user.street || '',
    city: user.city || '',
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(createFormDataFromUser(user));
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(createFormDataFromUser(user));
    }
  }, [user]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setFormData(createFormDataFromUser(user));
    setEditingSection(null);
  };

  const handleSavePersonalInfo = async () => {
    try {
      const input: UpdateUserInput = {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        phoneNumber: formData.phoneNumber || null,
        whatsappNumber: formData.whatsappNumber || null,
        gender: formData.gender || null,
        occupation: formData.occupation || null,
      };

      if (formData.dateOfBirth) {
        const birthDate = new Date(formData.dateOfBirth);
        birthDate.setUTCHours(12, 0, 0, 0);
        input.dateOfBirth = birthDate.toISOString();
      }

      if (formData.nationalId && formData.nationalId.trim() !== '') {
        input.nationalId = formData.nationalId;
      }

      const result = await updateProfile(input);
      if (result.success) {
        showSuccess('Personal information updated');
        setEditingSection(null);
        setFormData(prev => ({ ...prev, nationalId: '' }));
        await refreshUser();
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleSaveAddress = async () => {
    try {
      const input: UpdateUserInput = {
        region: formData.region || null,
        district: formData.district || null,
        ward: formData.ward || null,
        street: formData.street || null,
        address: formData.address || null,
        city: formData.city || null,
      };

      const result = await updateProfile(input);
      if (result.success) {
        showSuccess('Address updated');
        setEditingSection(null);
        await refreshUser();
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update address');
    }
  };

  const handleSaveEmergencyContact = async () => {
    try {
      const input: UpdateUserInput = {
        emergencyContactName: formData.emergencyContactName || null,
        emergencyContactPhone: formData.emergencyContactPhone || null,
      };

      const result = await updateProfile(input);
      if (result.success) {
        showSuccess('Emergency contact updated');
        setEditingSection(null);
        await refreshUser();
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update emergency contact');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-ink-100 p-8 text-center">
            <div className="w-16 h-16 bg-ink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircleIcon className="w-8 h-8 text-ink-400" />
            </div>
            <h2 className="text-xl font-semibold text-ink-900 mb-2">Sign in to view your profile</h2>
            <p className="text-ink-500 mb-6">
              Manage your personal information, preferences, and account settings.
            </p>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn-primary w-full"
            >
              Sign In
            </button>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Toast Messages */}
        {successMessage && (
          <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="fixed top-20 right-4 z-50 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
            {errorMessage}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-ink-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-semibold">
                {(user?.firstName ?? '?').charAt(0)}{(user?.lastName ?? '').charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-ink-900 truncate">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-ink-500 truncate">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {user?.userType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                    {user.userType}
                  </span>
                )}
                {user?.occupation && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-ink-600">
                    {user.occupation}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <ProfileSection
          title="Personal Information"
          isEditing={editingSection === 'personal'}
          onEdit={() => setEditingSection('personal')}
          onCancel={handleCancelEdit}
          onSave={handleSavePersonalInfo}
          isUpdating={isUpdating}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="First Name">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={editingSection !== 'personal'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Last Name">
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={editingSection !== 'personal'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Email" className="sm:col-span-2">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="field-input bg-ink-50 text-ink-400 cursor-not-allowed"
              />
              <p className="text-xs text-ink-400 mt-1">Email cannot be changed</p>
            </FieldGroup>
            <FieldGroup label="Phone Number" className="sm:col-span-2">
              {editingSection === 'personal' ? (
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(val) => handlePhoneChange('phoneNumber', val)}
                  placeholder="Enter phone number"
                />
              ) : (
                <input
                  type="text"
                  value={formData.phoneNumber || 'Not set'}
                  disabled
                  className="field-input"
                />
              )}
            </FieldGroup>
            <FieldGroup label="WhatsApp Number" className="sm:col-span-2">
              {editingSection === 'personal' ? (
                <PhoneInput
                  value={formData.whatsappNumber}
                  onChange={(val) => handlePhoneChange('whatsappNumber', val)}
                  placeholder="Enter WhatsApp number"
                />
              ) : (
                <input
                  type="text"
                  value={formData.whatsappNumber || 'Not set'}
                  disabled
                  className="field-input"
                />
              )}
            </FieldGroup>
            <FieldGroup label="Date of Birth">
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                onChange={handleInputChange}
                disabled={editingSection !== 'personal'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Gender">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                disabled={editingSection !== 'personal'}
                className="field-input"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Occupation" className="sm:col-span-2">
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                placeholder="e.g. Software Engineer"
                disabled={editingSection !== 'personal'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="National ID" className="sm:col-span-2">
              {editingSection === 'personal' ? (
                <>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    placeholder="Enter national ID number"
                    className="field-input"
                  />
                  <p className="text-xs text-ink-400 mt-1">Only the last 4 digits will be stored for verification</p>
                </>
              ) : (
                <input
                  type="text"
                  value={user?.nationalIdLast4 ? `****${user.nationalIdLast4}` : 'Not set'}
                  disabled
                  className="field-input"
                />
              )}
            </FieldGroup>
          </div>
        </ProfileSection>

        {/* Address Information */}
        <ProfileSection
          title="Address"
          isEditing={editingSection === 'address'}
          onEdit={() => setEditingSection('address')}
          onCancel={handleCancelEdit}
          onSave={handleSaveAddress}
          isUpdating={isUpdating}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Region">
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="e.g. Dar es Salaam"
                disabled={editingSection !== 'address'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="District">
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="e.g. Kinondoni"
                disabled={editingSection !== 'address'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Ward">
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleInputChange}
                placeholder="e.g. Msasani"
                disabled={editingSection !== 'address'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Street">
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g. Haile Selassie Rd"
                disabled={editingSection !== 'address'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="City">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="e.g. Dar es Salaam"
                disabled={editingSection !== 'address'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Additional Address" className="sm:col-span-2">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Apartment, suite, etc."
                disabled={editingSection !== 'address'}
                className="field-input"
              />
            </FieldGroup>
          </div>
        </ProfileSection>

        {/* Emergency Contact */}
        <ProfileSection
          title="Emergency Contact"
          isEditing={editingSection === 'emergency'}
          onEdit={() => setEditingSection('emergency')}
          onCancel={handleCancelEdit}
          onSave={handleSaveEmergencyContact}
          isUpdating={isUpdating}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Contact Name">
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleInputChange}
                placeholder="Full name"
                disabled={editingSection !== 'emergency'}
                className="field-input"
              />
            </FieldGroup>
            <FieldGroup label="Contact Phone">
              {editingSection === 'emergency' ? (
                <PhoneInput
                  value={formData.emergencyContactPhone}
                  onChange={(val) => handlePhoneChange('emergencyContactPhone', val)}
                  placeholder="Phone number"
                />
              ) : (
                <input
                  type="text"
                  value={formData.emergencyContactPhone || 'Not set'}
                  disabled
                  className="field-input"
                />
              )}
            </FieldGroup>
          </div>
          <p className="text-xs text-ink-400 mt-3">
            This information will only be shared with your host in case of an emergency during your stay.
          </p>
        </ProfileSection>
      </div>
    </div>
  );
}

// --- Reusable Sub-Components ---

function ProfileSection({
  title,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isUpdating,
  children,
}: {
  title: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isUpdating: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
        {!isEditing ? (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-ink-600 hover:text-ink-800 border border-ink-200 rounded-lg hover:bg-ink-50 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
