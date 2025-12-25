import React, { ReactNode, useRef } from 'react';

// Common Styles
export const CARD_BASE = "bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden";
export const INPUT_BASE = "w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-50 disabled:text-slate-500";
export const LABEL_BASE = "block text-sm font-medium text-slate-700 mb-1";

interface Props {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export const Card: React.FC<Props> = ({ children, className = '' }) => (
  <div className={`${CARD_BASE} ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<Props> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-slate-100 bg-slate-50/50 ${className}`}>
        {children}
    </div>
);

export const CardBody: React.FC<Props> = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
    children, 
    className = '', 
    variant = 'primary', 
    size = 'md',
    disabled,
    ...props 
}) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg";
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
        secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400 shadow-sm",
        danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-500",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        icon: "p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
    };

    const sizes = {
        sm: "text-xs px-3 py-1.5",
        md: "text-sm px-4 py-2",
        lg: "text-base px-6 py-3"
    };

    // Icon variant overrides size padding
    const sizeStyle = variant === 'icon' ? '' : sizes[size];

    return (
        <button
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizeStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className={className}>
    {label && <label className={LABEL_BASE}>{label}</label>}
    <input
      {...props}
      className={INPUT_BASE}
    />
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, className = '', children, ...props }) => (
  <div className={className}>
    {label && <label className={LABEL_BASE}>{label}</label>}
    <div className="relative">
        <select
        {...props}
        className={`${INPUT_BASE} appearance-none pr-10 cursor-pointer`}
        >
            {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
        </div>
    </div>
  </div>
);

export const Range: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string, valueDisplay?: string }> = ({ label, valueDisplay, className = '', ...props }) => (
  <div className={`flex flex-col gap-2 w-full ${className}`}>
    {(label || valueDisplay) && (
      <div className="flex justify-between items-center">
        {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
        {valueDisplay && <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{valueDisplay}</span>}
      </div>
    )}
    <input
      type="range"
      {...props}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

export const FileUpload: React.FC<{ onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, accept?: string, children?: ReactNode, className?: string }> = ({ onChange, accept, children, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onChange}
        accept={accept}
        className="hidden"
      />
      <div 
        onClick={handleClick}
        className={`
          border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50
          rounded-xl p-8 cursor-pointer
          flex flex-col items-center justify-center gap-3
          transition-all duration-200
          group
        `}
      >
        <div className="p-3 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 transition-colors">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <span className="font-medium text-slate-600 group-hover:text-blue-700">{children || 'Upload File'}</span>
      </div>
    </div>
  );
};

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          onClose();
      }
  }

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
        onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-[scaleIn_0.2s_ease-out]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Badge: React.FC<{ children: ReactNode, variant?: 'default' | 'success' | 'warning', className?: string }> = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700"
    };
    
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};
