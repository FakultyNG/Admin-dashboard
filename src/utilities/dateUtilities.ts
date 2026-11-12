export function getDates(hours: number, _startDate:string) {
  if (hours < 0) {
    throw new Error("Hours should be greater than 0");
  }

  // Get current date
  const startDate = _startDate === '' ? new Date() : new Date(_startDate);

  // Clone the date and add hours to it
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + hours);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

export const getTimeDifferenceInHours = (iso1: string, iso2: string): number => {
  const date1 = new Date(iso1);
  const date2 = new Date(iso2);

  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  const diffInHours = diffInMs / (1000 * 60 * 60);

  return diffInHours;
};

export const trimIsoToMinutes = (iso: string): string => {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function getFutureDateInISO(hours: number) {
  if (hours <= 0) {
    throw new Error("Hours must be greater than 0");
  }

  const currentDate = new Date(); // Get the current date and time
  currentDate.setHours(currentDate.getHours() + hours); // Add the number of hours to the current time

  return currentDate.toISOString(); // Return the ISO string representation of the new date and time
}


export function isExpired(expiry_date: string): boolean {
  const currentDate = new Date();
  const expiryDate = new Date(expiry_date);

  return currentDate > expiryDate;
}



export function formatDateToDDMMYYYY(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}


export function calculateEventDurationHours(startTime: string, expiryTime: string): number {
  const startDate = new Date(startTime);
  const expiryDate = new Date(expiryTime);

  const durationMilliseconds = expiryDate.getTime() - startDate.getTime();
  const durationHours = durationMilliseconds / (1000 * 60 * 60);

  return durationHours;
}

export function calculateRemainingEventHours(expiryTime: string): number {
  const expiryDate = new Date(expiryTime);
  const currentDate = new Date();

  if (currentDate.getTime() > expiryDate.getTime()) {
    return 0; // Event has expired, return 0 hours
  }

  const remainingMilliseconds = expiryDate.getTime() - currentDate.getTime();
  const remainingHours = remainingMilliseconds / (1000 * 60 * 60);

  return remainingHours;
}

/**
 * Convert a date-only Admin value to the instant at which that calendar day
 * begins in Nigeria. Date-only strings are otherwise parsed by JavaScript as
 * UTC midnight, which delays a Lagos release until 01:00 WAT.
 */
export function dateInputToLagosISOString(dateString: string): string {
  const dateOnly = dateString.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    throw new Error("Invalid date value");
  }

  return new Date(`${dateOnly}T00:00:00+01:00`).toISOString();
}

export function formatDateInputInLagos(dateString: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(dateString));
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}
