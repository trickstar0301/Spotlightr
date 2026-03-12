import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { type } from '@tauri-apps/plugin-os';
import type { IconType } from 'react-icons';
import { SiGooglemeet, SiGooglecalendar } from 'react-icons/si';
import { BsMicrosoftTeams } from 'react-icons/bs';
import './QuickActions.css';

const QUICK_ACTION_ICON_SIZE = 20;

interface QuickActionsProps {
    isCompact: boolean;
    selectedId?: string | null;
}

interface FocusAction {
    key: string;
    label: string;
    shortLabel: string;
    command: string;
    Icon: IconType;
    color: string;
    buttonClass: string;
    dockClass: string;
}

export function QuickActions({ isCompact, selectedId }: QuickActionsProps) {
    const [focusError, setFocusError] = useState<string | null>(null);
    const [isMac, setIsMac] = useState(true);

    useEffect(() => {
        setIsMac(type() === 'macos');
    }, []);

    const showError = (msg: string) => {
        setFocusError(msg);
        setTimeout(() => setFocusError(null), 3000);
    };

    const handleFocus = async (command: string, label: string) => {
        try {
            await invoke(command);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            showError(`${label}: ${errorMessage}`);
        }
    };

    const actions: FocusAction[] = [
        {
            key: 'action-meet',
            label: 'Google Meet',
            shortLabel: 'Meet',
            command: 'focus_google_meet',
            Icon: SiGooglemeet,
            color: '#00BFA5',
            buttonClass: 'btn-meet',
            dockClass: 'btn-meet-dock',
        },
        {
            key: 'action-teams',
            label: 'Microsoft Teams',
            shortLabel: 'Teams',
            command: 'focus_ms_teams',
            Icon: BsMicrosoftTeams,
            color: '#7B83EB',
            buttonClass: 'btn-teams',
            dockClass: 'btn-teams-dock',
        },
        {
            key: 'action-calendar',
            label: 'Google Calendar',
            shortLabel: 'Calendar',
            command: 'focus_google_calendar',
            Icon: SiGooglecalendar,
            color: '#1A73E8',
            buttonClass: 'btn-calendar',
            dockClass: 'btn-calendar-dock',
        },
    ];

    if (!isMac) {
        return null;
    }

    if (isCompact) {
        return (
            <>
                {focusError && (
                    <div className="focus-error-toast">{focusError}</div>
                )}
                <div
                    className="dock-list quick-actions-dock"
                >
                    {actions.map(({ key, label, command, Icon, color, dockClass }) => (
                        <button
                            key={key}
                            data-workspace-id={key}
                            onClick={() => handleFocus(command, label)}
                            className={`dock-tile ${dockClass}${selectedId === key ? ' selected' : ''}`}
                            aria-label={`Focus ${label}`}
                            title={label}
                        >
                            <div className="tile-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon color={color} />
                            </div>
                            <span className="dock-tooltip">{label}</span>
                        </button>
                    ))}
                </div>
            </>
        );
    }

    // Normal header layout
    return (
        <>
            {focusError && (
                <div className="focus-error-toast">{focusError}</div>
            )}
            {actions.map(({ key, label, shortLabel, command, Icon, color, buttonClass }) => (
                <button
                    key={key}
                    onClick={() => handleFocus(command, label)}
                    className={`${buttonClass}${selectedId === key ? ' selected' : ''}`}
                    aria-label={`Focus ${label}`}
                    title={`Focus ${label} open in Chrome`}
                >
                    <Icon size={QUICK_ACTION_ICON_SIZE} color={color} />
                    {shortLabel}
                </button>
            ))}
        </>
    );
}
