import Cookies from 'js-cookie';

// Types for the data
export interface ScheduleItem {
  time: string;
  name: string;
  location: string;
}

export interface ScheduleData {
  classes: ScheduleItem[];
}

export interface BusItem {
  route: string;
  time: string;
  destination: string;
}

export interface BusData {
  nextBuses: BusItem[];
  routes: { name: string; description: string }[];
}

export interface MenuData {
  today: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  tomorrow: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
  hours: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
}

export interface Event {
  date: string;
  name: string;
  location: string;
  time: string;
}

export interface EventData {
  upcoming: Event[];
  categories: string[];
  registration: {
    required: string[];
    link: string;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to fetch data from API
async function fetchFromAPI(endpoint: string, retries = 3) {
  try {
    const token = Cookies.get('token') || localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    console.log(`Fetching from ${baseUrl}${endpoint}...`);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        console.log(`Response status for ${endpoint} (attempt ${attempt}):`, response.status);
        console.log(`Response headers for ${endpoint}:`, Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          let errorMessage = `API error: ${response.statusText}`;
          try {
            const errorText = await response.text();
            console.error(`Raw error response from ${endpoint}:`, errorText);
            
            if (errorText) {
              try {
                const errorData = JSON.parse(errorText);
                console.error(`Parsed error response from ${endpoint}:`, errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
              } catch (parseError) {
                console.error(`Failed to parse error response as JSON from ${endpoint}:`, parseError);
                errorMessage = errorText || errorMessage;
              }
            }
          } catch (e) {
            console.error(`Failed to read error response from ${endpoint}:`, e);
          }
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        console.log(`Raw response from ${endpoint}:`, responseText);

        if (!responseText) {
          console.warn(`Empty response from ${endpoint}`);
          return { status: 'success', data: { data: [] } };
        }

        try {
          const data = JSON.parse(responseText);
          console.log(`Parsed response from ${endpoint}:`, data);
          return data;
        } catch (e) {
          console.error(`Failed to parse response as JSON from ${endpoint}:`, e);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${endpoint}:`, error);
        if (attempt === retries) {
          throw error;
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  } catch (error) {
    console.error(`All attempts failed for ${endpoint}:`, error);
    throw error;
  }
}

// Class schedule data
export async function getScheduleData(): Promise<ScheduleData> {
  try {
    const response = await fetchFromAPI('/schedules/my-schedule');
    console.log('Schedule API Response:', response);
    
    // Ensure we have the correct data structure with default values
    const scheduleData = response?.data?.data || [];
    
    // Ensure scheduleData is an array
    const schedulesArray = Array.isArray(scheduleData) ? scheduleData : 
                          Array.isArray(scheduleData.schedules) ? scheduleData.schedules :
                          Array.isArray(scheduleData.data) ? scheduleData.data : [];
    
    console.log('Schedules Array:', schedulesArray);
    
    return {
      classes: schedulesArray.map((item: any) => ({
        name: item.className || item.name || '',
        day: item.day || '',
        time: item.startTime ? `${item.startTime} - ${item.endTime}` : '',
        location: item.location || '',
        instructor: item.instructor || ''
      }))
    };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return {
      classes: []
    };
  }
}

// Bus schedule data
export async function getBusData(): Promise<BusData> {
  try {
    const response = await fetchFromAPI('/bus-routes');
    // Ensure we have the correct data structure with default values
    const busData = response?.data?.data || [];
    
    return {
      nextBuses: (busData || []).map((item: any) => ({
        route: item.route || '',
        time: item.time || '',
        destination: item.destination || ''
      })),
      routes: (busData || []).map((item: any) => ({
        name: item.route || '',
        description: item.description || ''
      }))
    };
  } catch (error) {
    console.error('Error fetching bus schedule:', error);
    return { nextBuses: [], routes: [] };
  }
}

// Cafeteria menu data
export async function getCafeteriaData(): Promise<MenuData> {
  try {
    const data = await fetchFromAPI('/cafeteria');
    return {
      today: {
        breakfast: data.today.breakfast || [],
        lunch: data.today.lunch || [],
        dinner: data.today.dinner || []
      },
      tomorrow: {
        breakfast: data.tomorrow.breakfast || [],
        lunch: data.tomorrow.lunch || [],
        dinner: data.tomorrow.dinner || []
      },
      hours: data.hours || {
        breakfast: "7-9am",
        lunch: "12-2pm",
        dinner: "6-8pm"
      }
    };
  } catch (error) {
    console.error('Error fetching cafeteria data:', error);
    return {
      today: { breakfast: [], lunch: [], dinner: [] },
      tomorrow: { breakfast: [], lunch: [], dinner: [] },
      hours: { breakfast: "7-9am", lunch: "12-2pm", dinner: "6-8pm" }
    };
  }
}

// Campus events data
export async function getEventData(): Promise<EventData> {
  try {
    const response = await fetchFromAPI('/events/chat');
    // Ensure we have the correct data structure with default values
    const eventData = response?.data?.data || { upcoming: [], categories: [], registration: { required: [], link: '' } };
    
    return {
      upcoming: (eventData.upcoming || []).map((item: any) => ({
        date: item.date || '',
        name: item.name || '',
        location: item.location || '',
        time: item.time || ''
      })),
      categories: eventData.categories || [],
      registration: {
        required: eventData.registration?.required || [],
        link: eventData.registration?.link || ''
      }
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      upcoming: [],
      categories: [],
      registration: { required: [], link: '' }
    };
  }
}

// FAQ data
export async function getFAQData(): Promise<FAQItem[]> {
  try {
    const response = await fetchFromAPI('/faq');
    console.log('FAQ API Response:', response);
    
    // Ensure we have the correct data structure with default values
    const faqData = response?.data?.data || [];
    
    // Ensure faqData is an array
    const faqsArray = Array.isArray(faqData) ? faqData : 
                     Array.isArray(faqData.faqs) ? faqData.faqs :
                     Array.isArray(faqData.data) ? faqData.data : [];
    
    console.log('FAQs Array:', faqsArray);
    
    return faqsArray.map((item: any) => ({
      question: item.question || '',
      answer: item.answer || ''
    }));
  } catch (error) {
    console.error('Error fetching FAQ:', error);
    return [];
  }
}
