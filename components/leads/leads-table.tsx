"use client";

import { memo, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { Lead } from "@/types/lead";

type LeadTableRow = Omit<Lead, "id">;
type ColumnKey = keyof LeadTableRow;

type LeadColumn = {
  key: ColumnKey;
  label: string;
  defaultWidth: number;
  minWidth: number;
  cellClassName?: string;
  headerClassName?: string;
  isResizable?: boolean;
  render?: (lead: LeadTableRow) => string;
};

type ActiveResize = {
  key: ColumnKey;
  startX: number;
  startWidth: number;
};

const MIN_COLUMN_STEP = 16;

const columns: LeadColumn[] = [
  {
    key: "businessType",
    label: "סוג עסק",
    defaultWidth: 180,
    minWidth: 140,
  },
  {
    key: "clientName",
    label: "שם לקוח",
    defaultWidth: 180,
    minWidth: 140,
  },
  {
    key: "clientPhone",
    label: "טלפון",
    defaultWidth: 150,
    minWidth: 136,
    cellClassName: "font-mono text-left ltr",
    headerClassName: "text-left ltr",
  },
  {
    key: "email",
    label: "אימייל",
    defaultWidth: 240,
    minWidth: 180,
    cellClassName: "font-mono text-left ltr",
    headerClassName: "text-left ltr",
  },
  {
    key: "hasWebsite",
    label: "אתר פעיל",
    defaultWidth: 120,
    minWidth: 110,
    render: (lead) => (lead.hasWebsite ? "כן" : "לא"),
  },
  {
    key: "websiteUrl",
    label: "כתובת אתר",
    defaultWidth: 260,
    minWidth: 190,
    cellClassName: "font-mono text-left ltr",
    headerClassName: "text-left ltr",
    render: (lead) => lead.websiteUrl || "-",
  },
];

const defaultWidths = columns.reduce<Record<ColumnKey, number>>(
  (accumulator, column) => {
    accumulator[column.key] = column.defaultWidth;
    return accumulator;
  },
  {} as Record<ColumnKey, number>,
);

function clampWidth(width: number, minWidth: number) {
  return Math.max(minWidth, width);
}

function LeadsTableComponent({ leads }: { leads: Lead[] }) {
  const [columnWidths, setColumnWidths] =
    useState<Record<ColumnKey, number>>(defaultWidths);
  const [activeResize, setActiveResize] = useState<ActiveResize | null>(null);

  const totalWidth = useMemo(
    () => columns.reduce((sum, column) => sum + columnWidths[column.key], 0),
    [columnWidths],
  );

  useEffect(() => {
    if (!activeResize) {
      return;
    }

    const column = columns.find(({ key }) => key === activeResize.key);

    if (!column) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const deltaX = activeResize.startX - event.clientX;
      setColumnWidths((previous) => ({
        ...previous,
        [activeResize.key]: clampWidth(
          activeResize.startWidth + deltaX,
          column.minWidth,
        ),
      }));
    };

    const stopResizing = () => {
      setActiveResize(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [activeResize]);

  const startResizing = (key: ColumnKey, clientX: number) => {
    setActiveResize({
      key,
      startWidth: columnWidths[key],
      startX: clientX,
    });
  };

  const handleKeyboardResize = (
    column: LeadColumn,
    direction: "increase" | "decrease",
  ) => {
    setColumnWidths((previous) => ({
      ...previous,
      [column.key]: clampWidth(
        previous[column.key] +
          (direction === "increase" ? MIN_COLUMN_STEP : -MIN_COLUMN_STEP),
        column.minWidth,
      ),
    }));
  };

  return (
    <div className='overflow-hidden rounded-[calc(var(--radius)*1.35)] border border-border/70 bg-card shadow-sm'>
      <div className='overflow-x-auto'>
        <table
          className='w-full border-collapse text-sm text-right'
          style={{ minWidth: `${totalWidth}px` }}>
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.key}
                style={{ width: `${columnWidths[column.key]}px` }}
              />
            ))}
          </colgroup>

          <thead className='bg-muted/55 text-muted-foreground'>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope='col'
                  className={cn(
                    "group relative border-b border-border/70 px-4 py-3 text-sm font-medium whitespace-nowrap",
                    column.headerClassName,
                  )}>
                  <span className='block truncate pe-3'>{column.label}</span>

                  {column.isResizable !== false ? (
                    <div
                      role='separator'
                      tabIndex={0}
                      aria-orientation='vertical'
                      aria-label={`שנה רוחב עמודת ${column.label}`}
                      aria-valuemin={column.minWidth}
                      aria-valuenow={columnWidths[column.key]}
                      className={cn(
                        "absolute inset-y-0 -left-1 hidden w-3 cursor-col-resize touch-none items-stretch justify-center outline-none sm:flex",
                        activeResize?.key === column.key && "flex",
                      )}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        startResizing(column.key, event.clientX);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowRight") {
                          event.preventDefault();
                          handleKeyboardResize(column, "increase");
                        }

                        if (event.key === "ArrowLeft") {
                          event.preventDefault();
                          handleKeyboardResize(column, "decrease");
                        }
                      }}>
                      <span
                        aria-hidden='true'
                        className={cn(
                          "my-2 w-px rounded-full bg-border transition-colors duration-200",
                          activeResize?.key === column.key
                            ? "bg-primary"
                            : "group-hover:bg-primary/70 group-focus-within:bg-primary/70",
                        )}
                      />
                    </div>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className={cn(
                  "border-b border-border/60 transition-colors duration-200 hover:bg-muted/40",
                  index === leads.length - 1 && "border-b-0",
                )}>
                {columns.map((column) => {
                  const value = column.render
                    ? column.render(lead)
                    : String(lead[column.key] ?? "-");

                  return (
                    <td
                      key={column.key}
                      title={value}
                      className={cn(
                        "max-w-0 px-4 py-3 align-middle text-foreground",
                        column.cellClassName,
                      )}>
                      {(column.key === "clientPhone" && (
                        <a
                          href={`tel:${value}`}
                          className='text-primary hover:underline'>
                          {value}
                        </a>
                      )) || <span className='block truncate'>{value}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const LeadsTable = memo(LeadsTableComponent);
