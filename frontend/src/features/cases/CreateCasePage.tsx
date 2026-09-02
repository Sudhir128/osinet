/**
 * OSINET Frontend — Create Case Page (wraps modal)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCaseModal from './CreateCaseModal';
import toast from 'react-hot-toast';

export default function CreateCasePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success('Case created successfully');
    navigate('/cases');
  };

  const handleCancel = () => {
    navigate('/cases');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">New Investigation Case</h1>
        </div>
      </div>
      {/* Render the form inline on the page (not as an overlay) */}
      <div style={{ maxWidth: '640px' }}>
        <CreateCaseModal onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
