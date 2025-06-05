import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllUsers,
  createUser,
  updateUser,
  resetUserPassword,
  getAllActiveUsers,
  getUserById,
  getUserByEmail,
  deleteUser,
  registerUser,
  sendCodeToUserEmail,
  resetPassword, // Función existente que usa /l/users/reset-password-with-code
  sendVerificationCode,
  verifyResetCode, // Función existente que usa /l/users/verify-code
  updateUserProfile,
  getCustomerStatistics,
  // getCustomerUsers, // No necesitamos un hook para esta, ya que getAllUsers + filtro cubre el caso
  // sendCodeToEmail, // Reemplazada por sendCodeToUserEmail basado en la API doc
} from '../services/admin/userService';

// Hook para obtener todos los usuarios
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    onError: (error) => {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    }
  });
};

// Hook para crear un usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success('Usuario registrado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error al registrar usuario:', error);
      toast.error(`Error al registrar usuario: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para actualizar un usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success('Usuario actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error al actualizar usuario:', error);
      toast.error(`Error al actualizar usuario: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para resetear la contraseña de un usuario (ya existente)
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, newPassword }) => resetUserPassword(userId, newPassword),
    onSuccess: () => {
      toast.success('Contraseña actualizada exitosamente');
      // Opcional: invalidar la caché si es necesario refrescar datos relacionados
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error al actualizar contraseña:', error);
      toast.error(`Error al actualizar contraseña: ${error.message || 'Error desconocido'}`);
    },
  });
};

// Hook para obtener todos los usuarios activos
export const useAllActiveUsers = () => {
  return useQuery({
    queryKey: ['users', 'active'],
    queryFn: getAllActiveUsers,
    onError: (error) => {
      console.error('Error al cargar usuarios activos:', error);
      toast.error('Error al cargar usuarios activos');
    }
  });
};

// Hook para obtener un usuario por ID
export const useUserById = (userId) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId, // Solo ejecutar si hay un ID
    onError: (error) => {
      console.error(`Error al cargar usuario con ID ${userId}:`, error);
      toast.error('Error al cargar usuario');
    }
  });
};

// Hook para obtener un usuario por email
export const useUserByEmail = (email) => {
  return useQuery({
    queryKey: ['users', 'byEmail', email],
    queryFn: () => getUserByEmail(email),
    enabled: !!email, // Solo ejecutar si hay un email
    onError: (error) => {
      console.error(`Error al cargar usuario con email ${email}:`, error);
      toast.error('Error al cargar usuario por email');
    }
  });
};

// Hook para eliminar un usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success('Usuario eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Error al eliminar usuario:', error);
      toast.error(`Error al eliminar usuario: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para registrar un nuevo usuario
export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Usuario registrado exitosamente');
      // Decidir si invalidar 'users' o solo notificar
    },
    onError: (error) => {
      console.error('Error al registrar usuario:', error);
      toast.error(`Error al registrar usuario: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para enviar código a email de usuario
export const useSendCodeToUserEmail = () => {
  return useMutation({
    mutationFn: sendCodeToUserEmail,
    onSuccess: () => {
      toast.success('Código enviado exitosamente al email');
    },
    onError: (error) => {
      console.error('Error al enviar código a email:', error);
      toast.error(`Error al enviar código a email: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para resetear contraseña con código (usa la función existente resetPassword)
export const useResetPasswordWithCode = () => {
  return useMutation({
    mutationFn: ({ email, code, newPassword }) => resetPassword(email, code, newPassword),
    onSuccess: () => {
      toast.success('Contraseña restablecida con código exitosamente');
    },
    onError: (error) => {
      console.error('Error al resetear contraseña con código:', error);
      toast.error(`Error al resetear contraseña con código: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para enviar código de verificación via WhatsApp
export const useSendVerificationCode = () => {
  return useMutation({
    mutationFn: sendVerificationCode,
    onSuccess: () => {
      toast.success('Código de verificación enviado por WhatsApp exitosamente');
    },
    onError: (error) => {
      console.error('Error al enviar código de verificación por WhatsApp:', error);
      toast.error(`Error al enviar código de verificación por WhatsApp: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para verificar código y cambiar contraseña (usa la función existente verifyResetCode)
export const useVerifyCodeAndChangePassword = () => {
  return useMutation({
    mutationFn: ({ email, code, newPassword }) => verifyResetCode(email, code, newPassword), // Asumiendo que verifyResetCode acepta estos args
    onSuccess: () => {
      toast.success('Código verificado y contraseña cambiada exitosamente');
    },
    onError: (error) => {
      console.error('Error al verificar código y cambiar contraseña:', error);
      toast.error(`Error al verificar código y cambiar contraseña: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para actualizar perfil de usuario
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, profileData }) => updateUserProfile(userId, profileData),
    onSuccess: (_, variables) => {
      toast.success('Perfil de usuario actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] }); // Invalidar el usuario específico
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidar la lista general también
    },
    onError: (error) => {
      console.error('Error al actualizar perfil de usuario:', error);
      toast.error(`Error al actualizar perfil de usuario: ${error || 'Error desconocido'}`);
    }
  });
};

// Hook para obtener estadísticas de clientes
export const useGetCustomerStatistics = () => {
  return useQuery({
    queryKey: ['users', 'stats', 'customers'],
    queryFn: getCustomerStatistics,
    onError: (error) => {
      console.error('Error al cargar estadísticas de clientes:', error);
      toast.error('Error al cargar estadísticas de clientes');
    }
  });
}; 