import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { type } from '@tauri-apps/plugin-os';
import { SiGooglemeet } from 'react-icons/si';
import { BsMicrosoftTeams } from 'react-icons/bs';
import './QuickActions.css';

interface QuickActionsProps {
    isCompact: boolean;
}

export function QuickActions({ isCompact }: QuickActionsProps) {
    const [meetError, setMeetError] = useState<string | null>(null);
    const [isMac, setIsMac] = useState(true);

    useEffect(() => {
        setIsMac(type() === 'macos');
    }, []);

    const showError = (msg: string) => {
        setMeetError(msg);
        setTimeout(() => setMeetError(null), 3000);
    };

    const handleFocusMeet = async () => {
        try {
            await invoke('focus_google_meet');
        } catch (error) {
            showError(`Google Meet: ${error}`);
        }
    };

    const handleFocusTeams = async () => {
        try {
            await invoke('focus_ms_teams');
        } catch (error) {
            showError(`Microsoft Teams: ${error}`);
        }
    };

    if (!isMac) {
        return null;
    }

    if (isCompact) {
        return (
            <>
                {meetError && (
                    <div className="meet-error-toast">{meetError}</div>
                )}
                <div className="dock-list quick-actions-dock" style={{ marginBottom: '0.5rem' }}>
                    <button
                        onClick={handleFocusMeet}
                        className="dock-tile btn-meet-dock"
                        aria-label="Focus Google Meet"
                        title="Google Meet"
                    >
                        <div className="tile-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SiGooglemeet size="2.4rem" color="#00BFA5" />
                        </div>
                        <span className="dock-tooltip">Google Meet</span>
                    </button>
                    <button
                        onClick={handleFocusTeams}
                        className="dock-tile btn-teams-dock"
                        aria-label="Focus Microsoft Teams"
                        title="Microsoft Teams"
                    >
                        <div className="tile-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BsMicrosoftTeams size="2.4rem" color="#7B83EB" />
                        </div>
                        <span className="dock-tooltip">Microsoft Teams</span>
                    </button>
                </div>
            </>
        );
    }

    // Normal header layout
    return (
        <>
            {meetError && (
                <div className="meet-error-toast">{meetError}</div>
            )}
            <button
                onClick={handleFocusMeet}
                className="btn-meet"
                aria-label="Focus Google Meet"
                title="Focus Google Meet open in Chrome"
            >
                <SiGooglemeet size={20} color="#00BFA5" />
                Meet
            </button>
            <button
                onClick={handleFocusTeams}
                className="btn-teams"
                aria-label="Focus Microsoft Teams"
                title="Focus Microsoft Teams open in Chrome"
            >
                <BsMicrosoftTeams size={20} color="#7B83EB" />
                Teams
            </button>
        </>
    );
}
