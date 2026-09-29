import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  ExternalLink,
  Upload,
  UserCheck,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { siwesApi } from '../api/siwesApi';
import { SiwesPlacement, SiwesWeeklyLog, SiwesDocument } from '../types/siwes';
import { useAuthStore } from '../store/authStore';

export const SiwesDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'logbook' | 'documents'>('overview');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // New Log Form State
  const [logForm, setLogForm] = useState({
    weekNumber: 1,
    startDate: '',
    endDate: '',
    activities: '',
    skillsLearned: '',
    challenges: '',
  });

  // Placement Form State
  const [placementForm, setPlacementForm] = useState({
    companyName: '',
    companyAddress: '',
    roleTitle: '',
    department: '',
    academicYear: '2024/2025',
    startDate: '',
    endDate: '',
    status: 'SEARCHING' as any,
    industrySupervisorName: '',
    industrySupervisorEmail: '',
    academicSupervisorName: '',
  });

  // Document Upload State
  const [docForm, setDocForm] = useState({
    docType: 'ACCEPTANCE_LETTER' as any,
    fileName: '',
    fileUrl: '',
    fileSize: 1048576,
  });

  const { isAuthenticated } = useAuthStore();
  const { data: placementData, isLoading: loadingPlacement } = useQuery({
    queryKey: ['mySiwesPlacement'],
    queryFn: () => siwesApi.getMyPlacement(),
    enabled: isAuthenticated,
  });

  const placement: SiwesPlacement | null = (placementData as any) || null;

  const { data: logsData, isLoading: loadingLogs } = useQuery({
    queryKey: ['mySiwesLogs'],
    queryFn: () => siwesApi.getMyLogs(),
    enabled: !!placement,
  });

  const logs: SiwesWeeklyLog[] = Array.isArray(logsData) ? logsData : (placement?.weeklyLogs || []);

  const { data: docsData, isLoading: loadingDocs } = useQuery({
    queryKey: ['mySiwesDocs'],
    queryFn: () => siwesApi.getMyDocuments(),
    enabled: !!placement,
  });

  const documents: SiwesDocument[] = Array.isArray(docsData) ? docsData : (placement?.documents || []);

  // Mutations
  const updatePlacementMutation = useMutation({
    mutationFn: (body: any) => siwesApi.createOrUpdatePlacement(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySiwesPlacement'] });
      setShowPlacementModal(false);
    },
  });

  const addLogMutation = useMutation({
    mutationFn: (body: any) => siwesApi.createWeeklyLog(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySiwesLogs'] });
      queryClient.invalidateQueries({ queryKey: ['mySiwesPlacement'] });
      setShowLogModal(false);
      setLogForm({
        weekNumber: logs.length + 2,
        startDate: '',
        endDate: '',
        activities: '',
        skillsLearned: '',
        challenges: '',
      });
    },
  });

  const addDocMutation = useMutation({
    mutationFn: (body: any) => siwesApi.uploadDocument(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySiwesDocs'] });
      setShowDocModal(false);
      setDocForm({
        docType: 'ACCEPTANCE_LETTER',
        fileName: '',
        fileUrl: '',
        fileSize: 1048576,
      });
    },
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PLACED':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'SEARCHING':
      case 'APPLIED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl">
                <Briefcase className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  SIWES & Internship Manager
                </h1>
                <p className="text-sm text-slate-400">
                  Track your industry attachment, submit weekly logbooks, and manage institutional compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (placement) {
                  setPlacementForm({
                    companyName: placement.companyName,
                    companyAddress: placement.companyAddress || '',
                    roleTitle: placement.roleTitle || '',
                    department: placement.department || '',
                    academicYear: (placement as any).academicYear || '2024/2025',
                    startDate: placement.startDate ? placement.startDate.substring(0, 10) : '',
                    endDate: placement.endDate ? placement.endDate.substring(0, 10) : '',
                    status: placement.status,
                    industrySupervisorName: placement.industrySupervisorName || '',
                    industrySupervisorEmail: placement.industrySupervisorEmail || '',
                    academicSupervisorName: placement.academicSupervisor?.profile?.fullName || '',
                  });
                }
                setShowPlacementModal(true);
              }}
              className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold transition flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-amber-400" />
              {placement ? 'Update Placement Info' : 'Register Placement'}
            </button>
            {placement && (
              <button
                onClick={() => {
                  setLogForm((prev) => ({ ...prev, weekNumber: logs.length + 1 }));
                  setShowLogModal(true);
                }}
                className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Weekly Log
              </button>
            )}
          </div>
        </div>

        {/* Status Banner */}
        {placement ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Placement Status</span>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(placement.status)}`}>
                  {placement.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-400 truncate font-mono">
                {placement.roleTitle || 'Intern'} @ {placement.companyName}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Weeks Completed</span>
              <p className="mt-2 text-2xl font-bold text-white">
                {logs.length} <span className="text-sm font-normal text-slate-400">/ 24 wks</span>
              </p>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (logs.length / 24) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Industry Supervisor</span>
              <p className="mt-2 text-sm font-semibold text-slate-200">
                {placement.industrySupervisorName || 'Not assigned yet'}
              </p>
              <p className="mt-1 text-xs text-slate-400 truncate">
                {placement.industrySupervisorEmail || 'No contact email provided'}
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Academic Supervisor</span>
              <p className="mt-2 text-sm font-semibold text-slate-200">
                {placement.academicSupervisor?.profile?.fullName || 'Department Faculty Advisor'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                CUSTECH Faculty of Computing & Informatics
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900/50 to-slate-900/50 border border-amber-500/20 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                No SIWES Placement Registered
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl">
                Register your SIWES/internship attachment details with CUSTECH FCI to enable weekly logbook submissions,
                institutional supervisor assignments, and final verification.
              </p>
            </div>
            <button
              onClick={() => setShowPlacementModal(true)}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/10 shrink-0"
            >
              Register Attachment Now
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 transition relative ${
              activeTab === 'overview' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Placement Overview
            {activeTab === 'overview' && (
              <motion.div layoutId="siwesTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('logbook')}
            className={`pb-3 transition relative ${
              activeTab === 'logbook' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Logbook ({logs.length})
            {activeTab === 'logbook' && (
              <motion.div layoutId="siwesTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 transition relative ${
              activeTab === 'documents' ? 'text-amber-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Documents & Letters ({documents.length})
            {activeTab === 'documents' && (
              <motion.div layoutId="siwesTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {placement ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" />
                    Company & Role Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Organization:</span>
                      <span className="text-slate-200 font-medium">{placement.companyName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Role / Designation:</span>
                      <span className="text-slate-200 font-medium">{placement.roleTitle}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Department / Unit:</span>
                      <span className="text-slate-200 font-medium">{placement.department}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Company Address:</span>
                      <span className="text-slate-200 font-medium text-right max-w-xs">{placement.companyAddress || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Academic Session:</span>
                      <span className="text-slate-200 font-medium">{(placement as any).academicYear || '2024/2025'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-400" />
                    Timeline & Compliance
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Start Date:</span>
                      <span className="text-slate-200 font-medium">
                        {placement.startDate ? new Date(placement.startDate).toLocaleDateString() : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Expected End Date:</span>
                      <span className="text-slate-200 font-medium">
                        {placement.endDate ? new Date(placement.endDate).toLocaleDateString() : 'Not recorded'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Total Duration:</span>
                      <span className="text-slate-200 font-medium">24 Weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Logbook Status:</span>
                      <span className="text-amber-400 font-medium">{logs.length} entries submitted</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-xl">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No active placement information</p>
                <p className="text-sm text-slate-500 mt-1">Please register your SIWES details to unlock tracking</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logbook' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Submitted Weekly Entries</h3>
              <button
                onClick={() => setShowLogModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Week Log
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-xl">
                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No weekly logs submitted yet</p>
                <p className="text-sm text-slate-500 mt-1">Document your tasks, skills gained, and challenges week by week.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                          Week {log.weekNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {log.startDate ? new Date(log.startDate).toLocaleDateString() : 'Week Start'} — {log.endDate ? new Date(log.endDate).toLocaleDateString() : 'Week End'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {log.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activities Carried Out</span>
                        <p className="mt-1 text-slate-200 whitespace-pre-line text-sm">{log.activities}</p>
                      </div>

                      {log.skillsLearned && (
                        <div>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills Acquired</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {log.skillsLearned.split(',').map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.challenges && (
                        <div>
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Challenges & Solutions</span>
                          <p className="mt-1 text-slate-300 text-xs">{log.challenges}</p>
                        </div>
                      )}

                      {log.supervisorComments && (
                        <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                          <span className="text-xs font-semibold text-amber-400">Supervisor Feedback:</span>
                          <p className="mt-0.5 text-slate-300 text-xs italic">{log.supervisorComments}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Attachment Documentation</h3>
              <button
                onClick={() => setShowDocModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Document
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-xl">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">No documents uploaded yet</p>
                <p className="text-sm text-slate-500 mt-1">Upload your acceptance letter, SIWES letter of intent, or evaluation reports.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {doc.docType.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200 truncate">{doc.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'File'} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Uploaded'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Submitted
                      </span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Placement Modal */}
      <AnimatePresence>
        {showPlacementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">SIWES / Placement Details</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updatePlacementMutation.mutate({
                    ...placementForm,
                    totalWeeks: 24,
                  });
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Company / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={placementForm.companyName}
                    onChange={(e) => setPlacementForm({ ...placementForm, companyName: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Role / Job Title *</label>
                  <input
                    type="text"
                    required
                    value={placementForm.roleTitle}
                    onChange={(e) => setPlacementForm({ ...placementForm, roleTitle: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Unit / Department *</label>
                    <input
                      type="text"
                      required
                      value={placementForm.department}
                      onChange={(e) => setPlacementForm({ ...placementForm, department: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Placement Status</label>
                    <select
                      value={placementForm.status}
                      onChange={(e) => setPlacementForm({ ...placementForm, status: e.target.value as any })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="SEARCHING">Searching</option>
                      <option value="APPLIED">Applied</option>
                      <option value="INTERVIEW">Interview</option>
                      <option value="OFFER_RECEIVED">Offer Received</option>
                      <option value="PLACED">Placed</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Start Date</label>
                    <input
                      type="date"
                      value={placementForm.startDate}
                      onChange={(e) => setPlacementForm({ ...placementForm, startDate: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">End Date</label>
                    <input
                      type="date"
                      value={placementForm.endDate}
                      onChange={(e) => setPlacementForm({ ...placementForm, endDate: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Company Address</label>
                  <input
                    type="text"
                    value={placementForm.companyAddress}
                    onChange={(e) => setPlacementForm({ ...placementForm, companyAddress: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Supervisor Contact</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-slate-400">Industry Supervisor Name</label>
                      <input
                        type="text"
                        value={placementForm.industrySupervisorName}
                        onChange={(e) => setPlacementForm({ ...placementForm, industrySupervisorName: e.target.value })}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">Industry Supervisor Email</label>
                      <input
                        type="email"
                        value={placementForm.industrySupervisorEmail}
                        onChange={(e) => setPlacementForm({ ...placementForm, industrySupervisorEmail: e.target.value })}
                        className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPlacementModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatePlacementMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    {updatePlacementMutation.isPending ? 'Saving...' : 'Save Placement'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">Record Weekly Log Entry</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addLogMutation.mutate(logForm);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Week Number *</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    required
                    value={logForm.weekNumber}
                    onChange={(e) => setLogForm({ ...logForm, weekNumber: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Week Start Date *</label>
                    <input
                      type="date"
                      required
                      value={logForm.startDate}
                      onChange={(e) => setLogForm({ ...logForm, startDate: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Week End Date *</label>
                    <input
                      type="date"
                      required
                      value={logForm.endDate}
                      onChange={(e) => setLogForm({ ...logForm, endDate: e.target.value })}
                      className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Activities & Tasks Performed *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Configured local router switches, analyzed packet captures using Wireshark, wrote automation scripts in Python..."
                    value={logForm.activities}
                    onChange={(e) => setLogForm({ ...logForm, activities: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Skills Learned (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Networking, Wireshark, Linux, Python"
                    value={logForm.skillsLearned}
                    onChange={(e) => setLogForm({ ...logForm, skillsLearned: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Challenges Encountered & How Resolved</label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes on difficulties and how you tackled them..."
                    value={logForm.challenges}
                    onChange={(e) => setLogForm({ ...logForm, challenges: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLogMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    {addLogMutation.isPending ? 'Submitting...' : 'Submit Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Doc Modal */}
      <AnimatePresence>
        {showDocModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b132b] border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8"
            >
              <h3 className="text-lg font-bold text-white">Upload SIWES Document</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  addDocMutation.mutate(docForm);
                }}
                className="space-y-3 text-sm"
              >
                <div>
                  <label className="text-xs text-slate-400">Document Type *</label>
                  <select
                    value={docForm.docType}
                    onChange={(e) => setDocForm({ ...docForm, docType: e.target.value as any })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="ACCEPTANCE_LETTER">Acceptance Letter</option>
                    <option value="PLACEMENT_LETTER">Placement Letter</option>
                    <option value="CV">Curriculum Vitae (CV)</option>
                    <option value="MONTHLY_REPORT">Monthly Report</option>
                    <option value="EVALUATION_FORM">Evaluation Form</option>
                    <option value="FINAL_REPORT">Final Report</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400">Document Title / File Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MTN_Nigeria_Acceptance_Letter.pdf"
                    value={docForm.fileName}
                    onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400">Document URL / Storage Reference *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://storage.custech.edu.ng/siwes/..."
                    value={docForm.fileUrl}
                    onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowDocModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addDocMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    {addDocMutation.isPending ? 'Uploading...' : 'Save Document'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
