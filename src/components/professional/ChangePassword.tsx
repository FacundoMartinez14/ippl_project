import React, { useState } from "react";
import Modal from "../Modal";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");

  const passwordsMatch = newPassword === repeatPassword;
  const canSubmit = passwordsMatch && !!newPassword;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(newPassword);
      setNewPassword("");
      setRepeatPassword("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4">Cambiar contraseña</h2>

      <div className="space-y-3">
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewPassword(e.target.value)
          }
          className="w-full rounded border p-2"
        />
        <input
          type="password"
          placeholder="Repetir contraseña"
          value={repeatPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRepeatPassword(e.target.value)
          }
          className="w-full rounded border p-2"
        />
        {!passwordsMatch && repeatPassword.length > 0 && (
          <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded border px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
