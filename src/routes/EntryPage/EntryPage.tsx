import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { allocateSecretSanta } from '../../utils/allocation';
import { encodePayload, SecretSantaPayload } from '../../utils/encoding';
import logo from '../../logo.png';

interface Participant {
  id: string;
  name: string;
  exclusions: string[];
}

export default function EntryPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [generatedUrls, setGeneratedUrls] = useState<
    Array<{ name: string; url: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const addParticipant = () => {
    const trimmed = newParticipantName.trim();
    if (!trimmed) return;

    // Check for duplicates
    if (
      participants.some(p => p.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError('Participant name must be unique');
      return;
    }

    setParticipants([
      ...participants,
      {
        id: Date.now().toString(),
        name: trimmed,
        exclusions: [],
      },
    ]);
    setNewParticipantName('');
    setError(null);
  };

  const removeParticipant = (id: string) => {
    const participantToRemove = participants.find(p => p.id === id);
    setParticipants(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // Remove from exclusions of other participants
      return filtered.map(p => ({
        ...p,
        exclusions: p.exclusions.filter(
          name => participantToRemove?.name !== name
        ),
      }));
    });
  };

  const toggleExclusion = (participantId: string, excludedName: string) => {
    setParticipants(
      participants.map(p => {
        if (p.id !== participantId) return p;
        const hasExclusion = p.exclusions.includes(excludedName);
        return {
          ...p,
          exclusions: hasExclusion
            ? p.exclusions.filter(n => n !== excludedName)
            : [...p.exclusions, excludedName],
        };
      })
    );
  };

  const handleGenerate = () => {
    setError(null);
    setGeneratedUrls([]);

    // Validation
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }

    if (participants.length < 2) {
      setError('At least 2 participants are required');
      return;
    }

    // Validate unique names
    const names = participants.map(p => p.name.toLowerCase());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      setError('All participant names must be unique');
      return;
    }

    // Validate exclusions don't include self
    for (const p of participants) {
      if (p.exclusions.includes(p.name)) {
        setError(`${p.name} cannot exclude themselves`);
        return;
      }
    }

    // Perform allocation
    const participantNames = participants.map(p => p.name);
    const exclusionsMap: Record<string, string[]> = {};
    participants.forEach(p => {
      exclusionsMap[p.name] = p.exclusions;
    });

    const allocation = allocateSecretSanta(participantNames, exclusionsMap);

    if (!allocation) {
      setError(
        'Could not generate a valid allocation. Try adjusting exclusions.'
      );
      return;
    }

    // Generate URLs
    const baseUrl =
      window.location.origin + window.location.pathname.replace(/\/$/, '');
    const urls = participantNames.map(name => {
      const payload: SecretSantaPayload = {
        t: title.trim(),
        d: description.trim(),
        g: name,
        r: allocation[name],
      };
      const encoded = encodePayload(payload);
      return {
        name,
        url: `${baseUrl}/play?data=${encoded}`,
      };
    });

    setGeneratedUrls(urls);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } catch (err) {
      // Silently fail - clipboard API may not be available
    }
  };

  const previewUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="Secret Santa"
            className="mx-auto"
            style={{
              maxWidth: '150px',
              border: '5px solid #ffffff',
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        {/* Entry Form */}
        <div className="pixel-frame mb-6">
          <h2 className="text-xs md:text-sm mb-6 text-center uppercase">
            Event Details
          </h2>

          <div className="mb-6">
            <label className="block text-xs mb-3 uppercase">
              Event Title *
            </label>
            <input
              type="text"
              className="pixel-input"
              value={title}
              onChange={e => setTitle(e.target.value.toUpperCase())}
              placeholder="CHRISTMAS 2025"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs mb-3 uppercase">Description</label>
            <textarea
              className="pixel-textarea"
              value={description}
              onChange={e => setDescription(e.target.value.toUpperCase())}
              placeholder="OPTIONAL EVENT DESCRIPTION..."
            />
          </div>
        </div>

        {/* Participants */}
        <div className="pixel-frame mb-6">
          <h2 className="text-xs md:text-sm mb-6 text-center uppercase">
            Participants
          </h2>

          <div className="mb-6 flex gap-3">
            <input
              type="text"
              className="pixel-input flex-1"
              value={newParticipantName}
              onChange={e => setNewParticipantName(e.target.value.toUpperCase())}
              onKeyPress={e => e.key === 'Enter' && addParticipant()}
              placeholder="ENTER NAME..."
            />
            <button
              className="pixel-button pixel-button-christmas"
              onClick={addParticipant}
            >
              Add
            </button>
          </div>

          {participants.length > 0 && (
            <div className="space-y-6">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="border-6 border-black p-6 bg-white"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase">
                      {participant.name}
                    </span>
                    <button
                      className="pixel-button-remove"
                      onClick={() => removeParticipant(participant.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {participants.length > 1 && (
                    <div className="mt-6 pt-4 border-t-4 border-gray-200">
                      <label className="text-xs block mb-4 uppercase">
                        Exclude:
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {participants
                          .filter(p => p.id !== participant.id)
                          .map(p => (
                            <label
                              key={p.id}
                              className="flex items-center gap-3 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="pixel-checkbox"
                                checked={participant.exclusions.includes(
                                  p.name
                                )}
                                onChange={() =>
                                  toggleExclusion(participant.id, p.name)
                                }
                              />
                              <span className="text-xs">{p.name}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="pixel-frame mb-6 bg-red-600 text-white border-red-800">
            <p className="text-xs text-center uppercase">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-6">
          <button
            className="pixel-button pixel-button-christmas text-sm w-full px-8 py-4"
            onClick={handleGenerate}
          >
            Generate Secret Santa
          </button>
        </div>

        {/* Generated URLs */}
        {generatedUrls.length > 0 && (
          <div className="pixel-frame">
            <h2 className="text-xs md:text-sm mb-6 text-center uppercase">
              Generated Links
            </h2>
            <div className="space-y-6">
              {generatedUrls.map(({ name, url }) => (
                <div key={name} className="border-6 border-black p-5 bg-white">
                  <div className="mb-4">
                    <span className="text-xs font-bold block mb-3 uppercase">
                      {name}
                    </span>
                    <div className="bg-gray-100 p-4 border-4 border-black break-all">
                      <code className="text-xs">{url}</code>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="pixel-button flex-1 text-xs"
                      onClick={() => copyToClipboard(url)}
                    >
                      Copy
                    </button>
                    <button
                      className="pixel-button pixel-button-secondary flex-1 text-xs"
                      onClick={() => previewUrl(url)}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
