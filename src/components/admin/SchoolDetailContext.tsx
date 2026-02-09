'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EditSchoolDialog } from './EditSchoolDialog';
import { InviteStudentDialog } from './InviteStudentDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { StudentDetailDialog } from './StudentDetailDialog';
import {
  updateStudentStatus,
  removeStudent,
  toggleSchoolStatus,
  deleteSchool,
} from '@/lib/actions/school-actions';

interface SchoolDetailContextType {
  schoolId: string;
  school: any;
  primaryColor: string;
  secondaryColor: string;
  openEditDialog: () => void;
  openInviteDialog: () => void;
  openAdminDialog: () => void;
  openToggleSchoolDialog: () => void;
  openDeleteSchoolDialog: () => void;
  openToggleStudentDialog: (student: any) => void;
  openRemoveStudentDialog: (student: any) => void;
  openStudentDetail: (student: any) => void;
}

const SchoolDetailContext = createContext<SchoolDetailContextType | undefined>(undefined);

export function useSchoolDetail() {
  const context = useContext(SchoolDetailContext);
  if (!context) {
    console.error('useSchoolDetail must be used within SchoolDetailProvider');
    throw new Error('useSchoolDetail must be used within SchoolDetailProvider');
  }
  return context;
}

export function SchoolDetailProvider({
  children,
  schoolId,
  school,
  primaryColor,
  secondaryColor,
}: {
  children: ReactNode;
  schoolId: string;
  school: any;
  primaryColor: string;
  secondaryColor: string;
}) {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetailOpen, setStudentDetailOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'warning' | 'danger' | 'info' | 'success';
    onConfirm: () => Promise<{ success?: boolean; error?: string }>;
  }>({
    open: false,
    title: '',
    description: '',
    type: 'warning',
    onConfirm: async () => ({}),
  });

  // Log for debugging
  useEffect(() => {
    console.log('SchoolDetailProvider mounted', { schoolId, school });
  }, [schoolId, school]);

  // School Actions
  const handleToggleSchool = async () => {
    console.log('handleToggleSchool called');
    const result = await toggleSchoolStatus(schoolId, school.subscription_status);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  const handleDeleteSchool = async () => {
    console.log('handleDeleteSchool called');
    return deleteSchool(schoolId);
  };

  // Student Actions
  const handleToggleStudent = async (student: any) => {
    console.log('handleToggleStudent called', student);
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    return updateStudentStatus(schoolId, student.user_id, newStatus);
  };

  const handleRemoveStudent = async (student: any) => {
    console.log('handleRemoveStudent called', student);
    return removeStudent(schoolId, student.user_id);
  };

  const openToggleStudentDialog = (student: any) => {
    console.log('openToggleStudentDialog called', student);
    const newStatus = student.status === 'active' ? 'suspended' : 'active';
    setConfirmDialog({
      open: true,
      title: newStatus === 'active' ? 'Activar Alumno' : 'Suspender Alumno',
      description: `¿Estás seguro de que quieres ${newStatus === 'active' ? 'activar' : 'suspender'} a ${student.profiles?.full_name || 'este alumno'}?`,
      type: 'warning',
      onConfirm: () => handleToggleStudent(student),
    });
  };

  const openRemoveStudentDialog = (student: any) => {
    console.log('openRemoveStudentDialog called', student);
    setConfirmDialog({
      open: true,
      title: 'Eliminar Alumno',
      description: `¿Estás seguro de que quieres eliminar a ${student.profiles?.full_name || 'este alumno'} de la autoescuela? Esta acción no se puede deshacer.`,
      type: 'danger',
      onConfirm: () => handleRemoveStudent(student),
    });
  };

  const openToggleSchoolDialog = () => {
    console.log('openToggleSchoolDialog called');
    const newStatus = school.subscription_status === 'active' ? 'suspended' : 'active';
    setConfirmDialog({
      open: true,
      title: newStatus === 'active' ? 'Activar Autoescuela' : 'Suspender Autoescuela',
      description: `¿Estás seguro de que quieres ${newStatus === 'active' ? 'activar' : 'suspender'} la autoescuela ${school.name}?`,
      type: 'warning',
      onConfirm: handleToggleSchool,
    });
  };

  const openDeleteSchoolDialog = () => {
    console.log('openDeleteSchoolDialog called');
    setConfirmDialog({
      open: true,
      title: 'Eliminar Autoescuela',
      description: `¿Estás seguro de que quieres eliminar la autoescuela ${school.name}? Esta acción eliminará todos los datos y no se puede deshacer.`,
      type: 'danger',
      onConfirm: handleDeleteSchool,
    });
  };

  const openStudentDetail = (student: any) => {
    console.log('openStudentDetail called', student);
    setSelectedStudent(student);
    setStudentDetailOpen(true);
  };

  const contextValue: SchoolDetailContextType = {
    schoolId,
    school,
    primaryColor,
    secondaryColor,
    openEditDialog: () => {
      console.log('openEditDialog called');
      setEditDialogOpen(true);
    },
    openInviteDialog: () => {
      console.log('openInviteDialog called');
      setInviteDialogOpen(true);
    },
    openAdminDialog: () => {
      console.log('openAdminDialog called');
      setAdminDialogOpen(true);
    },
    openToggleSchoolDialog,
    openDeleteSchoolDialog,
    openToggleStudentDialog,
    openRemoveStudentDialog,
    openStudentDetail,
  };

  return (
    <SchoolDetailContext.Provider value={contextValue}>
      {children}
      <EditSchoolDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        school={school}
        onSuccess={() => router.refresh()}
      />
      <InviteStudentDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        schoolId={schoolId}
        role="student"
        onSuccess={() => router.refresh()}
      />
      <InviteStudentDialog
        open={adminDialogOpen}
        onOpenChange={setAdminDialogOpen}
        schoolId={schoolId}
        role="admin"
        onSuccess={() => router.refresh()}
      />
      <StudentDetailDialog
        open={studentDetailOpen}
        onOpenChange={setStudentDetailOpen}
        student={selectedStudent}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />
      <ConfirmActionDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onSuccess={() => router.refresh()}
      />
    </SchoolDetailContext.Provider>
  );
}
