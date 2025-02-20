import { gapi } from "gapi-script";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

export const initGoogleApi = () => {
  if (typeof window === "undefined") return; // Prevent SSR issues

  gapi.load("client:auth2", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
      scope: SCOPES,
    });
  });
};

export const signIn = async () => {
  if (typeof window === "undefined") return null;

  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn();
  }
  return authInstance.currentUser.get().getAuthResponse();
};

export const signOut = () => {
  if (typeof window !== "undefined") {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut();
  }
};

export const getCalendarEvents = async () => {
  if (typeof window === "undefined") return [];

  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });
    return response.result.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};

export const createGoogleEvent = async (eventData: { title: string; startDate: string; endDate: string }) => {
  if (typeof window === "undefined") return;

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: {
        summary: eventData.title,
        start: { date: eventData.startDate },
        end: { date: eventData.endDate },
      },
    });
    return response.result;
  } catch (error) {
    console.error("Error creating calendar event:", error);
  }
};

export const syncLocalEventsToGoogle = async (localEvents: { title: string; start: string }[]) => {
  if (typeof window === "undefined") return;

  try {
    await signIn();
    for (const event of localEvents) {
      const startDate = event.start;
      const dateObj = new Date(startDate);
      dateObj.setDate(dateObj.getDate() + 1);
      const endDate = dateObj.toISOString().split("T")[0];

      await createGoogleEvent({ title: event.title, startDate, endDate });
    }
    alert("Local events pushed to Google Calendar successfully!");
  } catch (error) {
    console.error("Error pushing local events to Google Calendar:", error);
    alert("Failed to push local events to Google Calendar. Check console for details.");
  }
};
