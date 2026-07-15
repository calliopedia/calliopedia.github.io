const CALENDAR_ID = 'f1e7d7f577b571dabeeb3d2ff64ccff0a5cd65b97f52f006cc7020f091762aa1@group.calendar.google.com';
const TIME_ZONE = 'Europe/Paris';
const MAX_EVENTS = 8;

// IMPORTANT:
// Replace with your real Google API key (starts with AIza...)
const API_KEY = AIzaSyD84fQVSDScKqNoCOCakEWLHCqGxzKU6vs;

const agendaList = document.getElementById('agenda-events');

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatEventDateTime(event) {
  const start = event.start?.dateTime || event.start?.date;
  if (!start) return 'Date TBD';

  const date = new Date(start);
  const isAllDay = !!event.start?.date;

  const datePart = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: TIME_ZONE,
  }).format(date);

  if (isAllDay) return `${datePart} (all day)`;

  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  }).format(date);

  return `${datePart} — ${timePart}`;
}

function renderEvents(events) {
  if (!agendaList) return;

  if (!events || events.length === 0) {
    agendaList.innerHTML = '<li>No upcoming events.</li>';
    return;
  }

  agendaList.innerHTML = events
    .map((event) => {
      const title = escapeHtml(event.summary || 'Untitled event');
      const when = escapeHtml(formatEventDateTime(event));
      const link = event.htmlLink
        ? `<a href="${event.htmlLink}" target="_blank" rel="noopener noreferrer">${title}</a>`
        : title;

      return `<li><strong>${when}</strong><br>${link}</li>`;
    })
    .join('');
}

async function loadAgenda() {
  if (!agendaList) return;

  if (!API_KEY || API_KEY === 'PASTE_YOUR_GOOGLE_API_KEY_HERE') {
    agendaList.innerHTML = '<li>Please add your API key in agenda.js.</li>';
    return;
  }

  const params = new URLSearchParams({
    key: API_KEY,
    singleEvents: 'true',
    orderBy: 'startTime',
    timeMin: new Date().toISOString(),
    maxResults: String(MAX_EVENTS),
    timeZone: TIME_ZONE,
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Calendar API error: ${response.status}`);
    }

    const data = await response.json();
    renderEvents(data.items || []);
  } catch (error) {
    console.error(error);
    agendaList.innerHTML = '<li>Unable to load agenda right now.</li>';
  }
}

loadAgenda();
