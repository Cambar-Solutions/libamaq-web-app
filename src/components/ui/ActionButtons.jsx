import React, { useState, useRef, useEffect } from 'react';
import { GoPencil } from "react-icons/go";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";


const ActionButtons = ({ 
  onView, 
  onEdit, 
  onDelete, 
  onChangePassword,
  disabled = false,
  showView = true,
  showEdit = true,
  showDelete = true,
  showChangePassword = false,
  viewTitle = "Ver Detalles",
  editTitle = "Editar",
  deleteTitle = "Eliminar",
  changePasswordTitle = "Cambiar Contraseña",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState('bottom');
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const menuHeight = 120; // Altura aproximada del menú

      setMenuPosition(spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors ${className}`}
        title="Acciones"
      >
        <BsThreeDotsVertical size="1.1em" />
      </button>

      {isOpen && (
        <div 
          ref={menuRef}
          className="fixed z-50"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'transparent'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div 
            className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-48 transition-all duration-200 ease-in-out"
            style={{
              top: menuPosition === 'bottom' && buttonRef.current ? 
                `${buttonRef.current.getBoundingClientRect().bottom + 5}px` : 'auto',
              bottom: menuPosition === 'top' && buttonRef.current ? 
                `${window.innerHeight - buttonRef.current.getBoundingClientRect().top + 5}px` : 'auto',
              right: buttonRef.current ? `${window.innerWidth - buttonRef.current.getBoundingClientRect().right}px` : 'auto',
              transform: menuPosition === 'top' ? 'translateY(calc(-7%))' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {showView && (
              <button
                onClick={() => {
                  onView();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                title={viewTitle}
              >
                <MdOutlineRemoveRedEye className="mr-2" size="1.1em" />
                {viewTitle}
              </button>
            )}
            {showEdit && (
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                title={editTitle}
              >
                <GoPencil className="mr-2" size="1.1em" />
                {editTitle}
              </button>
            )}
            {showChangePassword && (
              <button
                onClick={() => {
                  onChangePassword();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                title={changePasswordTitle}
              >
                <GoPencil className="mr-2" size="1.1em" />
                {changePasswordTitle}
              </button>
            )}
            {showDelete && (
              <button
                onClick={() => {
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                title={deleteTitle}
              >
                <AiOutlineDelete className="mr-2" size="1.1em" />
                {deleteTitle}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons; 