import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTraveler, updateTraveler, deleteTraveler, addLoyaltyProgram, deleteLoyaltyProgram, addEmergencyContact, deleteEmergencyContact } from '../../server/fns/trip-details';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, User, Phone, Mail, Shield, CreditCard, Heart,
  ChevronDown, ChevronRight, Edit3, X, Check, UserPlus, Users,
  Plane, Hotel, Car, Star, AlertTriangle, Globe,
} from 'lucide-react';
import type { Traveler, LoyaltyProgram, EmergencyContact } from '../../types/trips';

interface Props {
  tripId: string;
  items: Traveler[];
}

const SEAT_PREFS = [
  { value: 'window', label: 'Window' },
  { value: 'aisle', label: 'Aisle' },
  { value: 'middle', label: 'Middle' },
  { value: '', label: 'No preference' },
];

const PROGRAM_TYPES = [
  { value: 'airline', label: 'Airline', icon: Plane },
  { value: 'hotel', label: 'Hotel', icon: Hotel },
  { value: 'car_rental', label: 'Car Rental', icon: Car },
  { value: 'other', label: 'Other', icon: Star },
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Kosher', 'Halal',
  'Lactose-Free', 'Nut-Free', 'Pescatarian', 'Low Sodium',
];

export function TravelersTab({ tripId, items }: Props) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showLoyaltyForm, setShowLoyaltyForm] = useState<string | null>(null);
  const [showEmergencyForm, setShowEmergencyForm] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['trip', tripId] });

  // Add traveler form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '',
    passportNumber: '', passportCountry: '', passportExpiry: '',
    tsaPrecheckNumber: '', globalEntryNumber: '', knownTravelerNumber: '',
    dietaryNeeds: '' as string, mealPreference: '', seatPreference: '',
    specialAssistance: '', notes: '', isPrimary: false,
  });

  const [editForm, setEditForm] = useState({ ...form });
  const [loyaltyForm, setLoyaltyForm] = useState({ programType: 'airline', programName: '', memberNumber: '', tierStatus: '' });
  const [emergencyForm, setEmergencyForm] = useState({ name: '', relationship: '', phone: '', email: '' });

  const addMutation = useMutation({
    mutationFn: (data: typeof form) => {
      const dietaryNeeds = data.dietaryNeeds ? JSON.stringify(data.dietaryNeeds.split(',').map(s => s.trim()).filter(Boolean)) : null;
      return addTraveler({ data: { tripId, ...data, dietaryNeeds, orderIndex: items.length } });
    },
    onSuccess: () => {
      invalidate();
      setShowAdd(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '', passportNumber: '', passportCountry: '', passportExpiry: '', tsaPrecheckNumber: '', globalEntryNumber: '', knownTravelerNumber: '', dietaryNeeds: '', mealPreference: '', seatPreference: '', specialAssistance: '', notes: '', isPrimary: false });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => {
      const dietaryNeeds = data.dietaryNeeds ? JSON.stringify(data.dietaryNeeds.split(',').map((s: string) => s.trim()).filter(Boolean)) : null;
      return updateTraveler({ data: { tripId, ...data, dietaryNeeds } });
    },
    onSuccess: () => { invalidate(); setEditingId(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTraveler({ data: { tripId, id } }),
    onSuccess: invalidate,
  });

  const addLoyaltyMutation = useMutation({
    mutationFn: (data: { travelerId: string } & typeof loyaltyForm) => addLoyaltyProgram({ data }),
    onSuccess: () => { invalidate(); setShowLoyaltyForm(null); setLoyaltyForm({ programType: 'airline', programName: '', memberNumber: '', tierStatus: '' }); },
  });

  const deleteLoyaltyMutation = useMutation({
    mutationFn: (id: string) => deleteLoyaltyProgram({ data: { id } }),
    onSuccess: invalidate,
  });

  const addEmergencyMutation = useMutation({
    mutationFn: (data: { travelerId: string } & typeof emergencyForm) => addEmergencyContact({ data }),
    onSuccess: () => { invalidate(); setShowEmergencyForm(null); setEmergencyForm({ name: '', relationship: '', phone: '', email: '' }); },
  });

  const deleteEmergencyMutation = useMutation({
    mutationFn: (id: string) => deleteEmergencyContact({ data: { id } }),
    onSuccess: invalidate,
  });

  const startEdit = (t: Traveler) => {
    const dietary = t.dietaryNeeds ? JSON.parse(t.dietaryNeeds).join(', ') : '';
    setEditForm({
      firstName: t.firstName, lastName: t.lastName,
      email: t.email || '', phone: t.phone || '',
      dateOfBirth: t.dateOfBirth || '', gender: t.gender || '',
      passportNumber: t.passportNumber || '', passportCountry: t.passportCountry || '',
      passportExpiry: t.passportExpiry || '',
      tsaPrecheckNumber: t.tsaPrecheckNumber || '', globalEntryNumber: t.globalEntryNumber || '',
      knownTravelerNumber: t.knownTravelerNumber || '',
      dietaryNeeds: dietary, mealPreference: t.mealPreference || '',
      seatPreference: t.seatPreference || '', specialAssistance: t.specialAssistance || '',
      notes: t.notes || '', isPrimary: t.isPrimary || false,
    });
    setEditingId(t.id);
    setExpandedId(t.id);
  };

  const parseDietary = (raw: string | null): string[] => {
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={20} className="text-ody-accent" />
          <h3 className="text-lg font-semibold">Travelers</h3>
          <span className="text-sm text-ody-text-muted bg-ody-surface-hover px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'person' : 'people'}
          </span>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-2 bg-ody-accent text-white rounded-lg hover:bg-ody-accent/80 transition-colors text-sm">
          <UserPlus size={16} /> Add Traveler
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="bg-ody-surface rounded-xl border border-ody-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">New Traveler</h4>
              <button onClick={() => setShowAdd(false)} className="text-ody-text-muted hover:text-ody-text"><X size={18} /></button>
            </div>
            <TravelerForm form={form} setForm={setForm} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-ody-text-muted hover:text-ody-text">Cancel</button>
              <button onClick={() => addMutation.mutate(form)} disabled={!form.firstName || !form.lastName || addMutation.isPending}
                className="px-3 py-1.5 text-sm bg-ody-accent text-white rounded-lg hover:bg-ody-accent/80 disabled:opacity-50">
                {addMutation.isPending ? 'Adding...' : 'Add Traveler'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Traveler List */}
      {items.length === 0 && !showAdd && (
        <div className="text-center py-12 text-ody-text-muted">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p>No travelers added yet</p>
          <p className="text-sm mt-1">Add travelers to manage passenger info, loyalty programs, and more</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(traveler => {
          const isExpanded = expandedId === traveler.id;
          const isEditing = editingId === traveler.id;
          const dietary = parseDietary(traveler.dietaryNeeds);

          return (
            <motion.div key={traveler.id} layout
              className="bg-ody-surface rounded-xl border border-ody-border overflow-hidden">
              {/* Collapsed Header */}
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-ody-surface-hover transition-colors"
                onClick={() => { setExpandedId(isExpanded ? null : traveler.id); if (isEditing && !isExpanded) setEditingId(null); }}>
                <div className="w-10 h-10 rounded-full bg-ody-accent/20 flex items-center justify-center text-ody-accent font-semibold text-sm">
                  {traveler.firstName[0]}{traveler.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{traveler.firstName} {traveler.lastName}</span>
                    {traveler.isPrimary && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-ody-accent/20 text-ody-accent">Primary</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ody-text-muted mt-0.5">
                    {traveler.email && <span className="flex items-center gap-1"><Mail size={11} />{traveler.email}</span>}
                    {traveler.phone && <span className="flex items-center gap-1"><Phone size={11} />{traveler.phone}</span>}
                    {traveler.passportCountry && <span className="flex items-center gap-1"><Globe size={11} />{traveler.passportCountry}</span>}
                    {dietary.length > 0 && <span className="flex items-center gap-1">🍽️ {dietary.join(', ')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(traveler.tsaPrecheckNumber || traveler.globalEntryNumber) && (
                    <Shield size={16} className="text-ody-success" title="TSA PreCheck / Global Entry" />
                  )}
                  {(traveler.loyaltyPrograms?.length || 0) > 0 && (
                    <CreditCard size={16} className="text-ody-info" title={`${traveler.loyaltyPrograms!.length} loyalty programs`} />
                  )}
                  {(traveler.emergencyContacts?.length || 0) > 0 && (
                    <Heart size={16} className="text-ody-danger" title="Emergency contact on file" />
                  )}
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden border-t border-ody-border">
                    <div className="p-4 space-y-4">
                      {isEditing ? (
                        <>
                          <TravelerForm form={editForm} setForm={setEditForm} />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-ody-text-muted hover:text-ody-text">Cancel</button>
                            <button onClick={() => updateMutation.mutate({ id: traveler.id, ...editForm })}
                              disabled={!editForm.firstName || !editForm.lastName || updateMutation.isPending}
                              className="px-3 py-1.5 text-sm bg-ody-accent text-white rounded-lg hover:bg-ody-accent/80 disabled:opacity-50">
                              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <InfoField label="Email" value={traveler.email} />
                            <InfoField label="Phone" value={traveler.phone} />
                            <InfoField label="Date of Birth" value={traveler.dateOfBirth} />
                            <InfoField label="Gender" value={traveler.gender} />
                            <InfoField label="Seat Preference" value={traveler.seatPreference} />
                            <InfoField label="Meal Preference" value={traveler.mealPreference} />
                          </div>

                          {/* Passport */}
                          {(traveler.passportNumber || traveler.passportCountry) && (
                            <div className="bg-ody-base rounded-lg p-3">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Passport</h5>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <InfoField label="Number" value={traveler.passportNumber} />
                                <InfoField label="Country" value={traveler.passportCountry} />
                                <InfoField label="Expiry" value={traveler.passportExpiry} />
                              </div>
                            </div>
                          )}

                          {/* Travel Docs */}
                          {(traveler.tsaPrecheckNumber || traveler.globalEntryNumber || traveler.knownTravelerNumber) && (
                            <div className="bg-ody-base rounded-lg p-3">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Travel Documents</h5>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <InfoField label="TSA PreCheck" value={traveler.tsaPrecheckNumber} />
                                <InfoField label="Global Entry" value={traveler.globalEntryNumber} />
                                <InfoField label="Known Traveler #" value={traveler.knownTravelerNumber} />
                              </div>
                            </div>
                          )}

                          {/* Dietary */}
                          {dietary.length > 0 && (
                            <div className="bg-ody-base rounded-lg p-3">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Dietary Needs</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {dietary.map(d => (
                                  <span key={d} className="text-xs px-2 py-1 rounded-full bg-ody-surface border border-ody-border">{d}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {traveler.specialAssistance && (
                            <div className="bg-ody-base rounded-lg p-3">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Special Assistance</h5>
                              <p className="text-sm">{traveler.specialAssistance}</p>
                            </div>
                          )}

                          {traveler.notes && (
                            <div className="bg-ody-base rounded-lg p-3">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Notes</h5>
                              <p className="text-sm">{traveler.notes}</p>
                            </div>
                          )}

                          {/* Loyalty Programs */}
                          <div className="bg-ody-base rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase">Loyalty Programs</h5>
                              <button onClick={(e) => { e.stopPropagation(); setShowLoyaltyForm(traveler.id); }}
                                className="text-xs text-ody-accent hover:text-ody-accent/80 flex items-center gap-1">
                                <Plus size={12} /> Add
                              </button>
                            </div>
                            {(traveler.loyaltyPrograms?.length || 0) === 0 && !showLoyaltyForm && (
                              <p className="text-xs text-ody-text-dim">No loyalty programs added</p>
                            )}
                            <div className="space-y-2">
                              {traveler.loyaltyPrograms?.map(lp => {
                                const TypeIcon = PROGRAM_TYPES.find(p => p.value === lp.programType)?.icon || Star;
                                return (
                                  <div key={lp.id} className="flex items-center justify-between bg-ody-surface rounded-lg p-2 text-sm">
                                    <div className="flex items-center gap-2">
                                      <TypeIcon size={14} className="text-ody-text-muted" />
                                      <span className="font-medium">{lp.programName}</span>
                                      <span className="text-ody-text-muted">{lp.memberNumber}</span>
                                      {lp.tierStatus && <span className="text-xs px-1.5 py-0.5 rounded bg-ody-accent/20 text-ody-accent">{lp.tierStatus}</span>}
                                    </div>
                                    <button onClick={() => deleteLoyaltyMutation.mutate(lp.id)}
                                      className="text-ody-text-dim hover:text-ody-danger"><Trash2 size={14} /></button>
                                  </div>
                                );
                              })}
                              {showLoyaltyForm === traveler.id && (
                                <div className="bg-ody-surface rounded-lg p-3 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <select value={loyaltyForm.programType} onChange={e => setLoyaltyForm({ ...loyaltyForm, programType: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm">
                                      {PROGRAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                    <input placeholder="Program Name" value={loyaltyForm.programName}
                                      onChange={e => setLoyaltyForm({ ...loyaltyForm, programName: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                    <input placeholder="Member Number" value={loyaltyForm.memberNumber}
                                      onChange={e => setLoyaltyForm({ ...loyaltyForm, memberNumber: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                    <input placeholder="Tier Status (optional)" value={loyaltyForm.tierStatus}
                                      onChange={e => setLoyaltyForm({ ...loyaltyForm, tierStatus: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowLoyaltyForm(null)} className="px-2 py-1 text-xs text-ody-text-muted">Cancel</button>
                                    <button onClick={() => addLoyaltyMutation.mutate({ travelerId: traveler.id, ...loyaltyForm })}
                                      disabled={!loyaltyForm.programName || !loyaltyForm.memberNumber}
                                      className="px-2 py-1 text-xs bg-ody-accent text-white rounded-lg disabled:opacity-50">Add</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Emergency Contacts */}
                          <div className="bg-ody-base rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-semibold text-ody-text-muted uppercase">Emergency Contacts</h5>
                              <button onClick={(e) => { e.stopPropagation(); setShowEmergencyForm(traveler.id); }}
                                className="text-xs text-ody-accent hover:text-ody-accent/80 flex items-center gap-1">
                                <Plus size={12} /> Add
                              </button>
                            </div>
                            {(traveler.emergencyContacts?.length || 0) === 0 && !showEmergencyForm && (
                              <p className="text-xs text-ody-text-dim">No emergency contacts added</p>
                            )}
                            <div className="space-y-2">
                              {traveler.emergencyContacts?.map(ec => (
                                <div key={ec.id} className="flex items-center justify-between bg-ody-surface rounded-lg p-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-ody-danger" />
                                    <span className="font-medium">{ec.name}</span>
                                    {ec.relationship && <span className="text-ody-text-muted">({ec.relationship})</span>}
                                    <span className="text-ody-text-muted">{ec.phone}</span>
                                  </div>
                                  <button onClick={() => deleteEmergencyMutation.mutate(ec.id)}
                                    className="text-ody-text-dim hover:text-ody-danger"><Trash2 size={14} /></button>
                                </div>
                              ))}
                              {showEmergencyForm === traveler.id && (
                                <div className="bg-ody-surface rounded-lg p-3 space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input placeholder="Name" value={emergencyForm.name}
                                      onChange={e => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                    <input placeholder="Relationship" value={emergencyForm.relationship}
                                      onChange={e => setEmergencyForm({ ...emergencyForm, relationship: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                    <input placeholder="Phone" value={emergencyForm.phone}
                                      onChange={e => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                    <input placeholder="Email (optional)" value={emergencyForm.email}
                                      onChange={e => setEmergencyForm({ ...emergencyForm, email: e.target.value })}
                                      className="bg-ody-base border border-ody-border rounded-lg px-2 py-1.5 text-sm" />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <button onClick={() => setShowEmergencyForm(null)} className="px-2 py-1 text-xs text-ody-text-muted">Cancel</button>
                                    <button onClick={() => addEmergencyMutation.mutate({ travelerId: traveler.id, ...emergencyForm })}
                                      disabled={!emergencyForm.name || !emergencyForm.phone}
                                      className="px-2 py-1 text-xs bg-ody-accent text-white rounded-lg disabled:opacity-50">Add</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 pt-2 border-t border-ody-border">
                            <button onClick={() => startEdit(traveler)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ody-text-muted hover:text-ody-text hover:bg-ody-surface-hover rounded-lg transition-colors">
                              <Edit3 size={14} /> Edit
                            </button>
                            <button onClick={() => { if (confirm(`Remove ${traveler.firstName} ${traveler.lastName}?`)) deleteMutation.mutate(traveler.id); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ody-danger/70 hover:text-ody-danger hover:bg-ody-danger/10 rounded-lg transition-colors">
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-ody-text-dim">{label}</dt>
      <dd className="text-ody-text">{value}</dd>
    </div>
  );
}

function TravelerForm({ form, setForm }: { form: any; setForm: (f: any) => void }) {
  const input = "bg-ody-base border border-ody-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ody-accent";
  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <div>
        <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Basic Information</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input placeholder="First Name *" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={input} />
          <input placeholder="Last Name *" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={input} />
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={input} />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={input} />
          <input placeholder="Date of Birth" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className={input} />
          <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={input}>
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>
      </div>

      {/* Passport */}
      <div>
        <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Passport Information</h5>
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="Passport Number" value={form.passportNumber} onChange={e => setForm({ ...form, passportNumber: e.target.value })} className={input} />
          <input placeholder="Issuing Country" value={form.passportCountry} onChange={e => setForm({ ...form, passportCountry: e.target.value })} className={input} />
          <input placeholder="Expiry Date" type="date" value={form.passportExpiry} onChange={e => setForm({ ...form, passportExpiry: e.target.value })} className={input} />
        </div>
      </div>

      {/* Travel Docs */}
      <div>
        <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Travel Documents</h5>
        <div className="grid grid-cols-3 gap-3">
          <input placeholder="TSA PreCheck #" value={form.tsaPrecheckNumber} onChange={e => setForm({ ...form, tsaPrecheckNumber: e.target.value })} className={input} />
          <input placeholder="Global Entry #" value={form.globalEntryNumber} onChange={e => setForm({ ...form, globalEntryNumber: e.target.value })} className={input} />
          <input placeholder="Known Traveler #" value={form.knownTravelerNumber} onChange={e => setForm({ ...form, knownTravelerNumber: e.target.value })} className={input} />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h5 className="text-xs font-semibold text-ody-text-muted uppercase mb-2">Preferences</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <input placeholder="Dietary Needs (comma separated)" value={form.dietaryNeeds} onChange={e => setForm({ ...form, dietaryNeeds: e.target.value })} className={input} />
          <input placeholder="Meal Preference" value={form.mealPreference} onChange={e => setForm({ ...form, mealPreference: e.target.value })} className={input} />
          <select value={form.seatPreference} onChange={e => setForm({ ...form, seatPreference: e.target.value })} className={input}>
            <option value="">Seat Preference</option>
            {SEAT_PREFS.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea placeholder="Special Assistance" value={form.specialAssistance} onChange={e => setForm({ ...form, specialAssistance: e.target.value })}
          className={`${input} resize-none`} rows={2} />
        <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
          className={`${input} resize-none`} rows={2} />
      </div>

      {/* Primary toggle */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={form.isPrimary} onChange={e => setForm({ ...form, isPrimary: e.target.checked })}
          className="rounded border-ody-border" />
        Primary traveler (trip organizer)
      </label>
    </div>
  );
}
