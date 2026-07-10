import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import "./ActionsMenu.css";

function ActionsMenu({ items, label = "More actions" }) {
    const [open, setOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const visibleItems = items.filter(item => !item.hidden);

    useEffect(() => {
        if (!open) return;

        const updatePosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (rect) {
                setDropdownStyle({
                    position: "fixed",
                    top: rect.bottom + 4,
                    right: window.innerWidth - rect.right,
                });
            }
        };

        const handleOutsideClick = (event) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        updatePosition();
        document.addEventListener("mousedown", handleOutsideClick);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open]);

    if (!visibleItems.length) return null;

    return (
        <div className="actions-menu-wrapper">
            <button
                ref={buttonRef}
                type="button"
                className="actions-menu-btn"
                onClick={() => setOpen(current => !current)}
                aria-label={label}
                aria-expanded={open}
            >
                <MoreVertical size={16} />
            </button>
            {open && createPortal(
                <div ref={menuRef} className="actions-dropdown" style={dropdownStyle}>
                    {visibleItems.map(item => (
                        <button
                            key={item.label}
                            type="button"
                            className="actions-dropdown-item"
                            onClick={() => {
                                setOpen(false);
                                item.onClick();
                            }}
                            disabled={item.disabled}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

export default ActionsMenu;