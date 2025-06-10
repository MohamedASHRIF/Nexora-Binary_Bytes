"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ClassSchedule {
  _id: string;
  className: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
}

interface BusTiming {
  _id: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  stops: string[];
  duration: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();

  // New schedule form state
  const [newSchedule, setNewSchedule] = useState({
    className: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    location: '',
    instructor: ''
  });

  // Add state for bus timings and events
  const [busTimings, setBusTimings] = useState<BusTiming[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newBusTiming, setNewBusTiming] = useState<Partial<BusTiming>>({ 
    route: '', 
    departureTime: '', 
    arrivalTime: '', 
    stops: [],
    duration: ''
  });
  const [newEvent, setNewEvent] = useState<Partial<Event>>({ 
    title: '', 
    description: '', 
    date: '', 
    time: '',
    location: '' 
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get('token') || localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch users
        const usersResponse = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        if (!usersResponse.ok) {
          if (usersResponse.status === 403) {
            throw new Error('Access denied. Admin privileges required.');
          }
          throw new Error('Failed to fetch users');
        }

        const usersData = await usersResponse.json();
        console.log('Users API Response:', usersData);

        // Ensure we're accessing the correct data structure
        const usersArray = Array.isArray(usersData.data) ? usersData.data : 
                          Array.isArray(usersData.data?.users) ? usersData.data.users :
                          Array.isArray(usersData.users) ? usersData.users : [];

        console.log('Users Array:', usersArray);

        // Transform the data to ensure each user has a unique ID
        const transformedUsers = usersArray.map((user: any, index: number) => ({
          _id: user._id || user.id || `user-${index}-${Math.random().toString(36).substr(2, 9)}`, // Ensure we always have a unique ID
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          createdAt: user.createdAt || new Date().toISOString()
        }));

        console.log('Transformed Users:', transformedUsers);
        setUsers(transformedUsers);

        // Fetch schedules
        const schedulesResponse = await fetch('http://localhost:5000/api/schedules/my-schedule', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();
          console.log('Schedules API Response:', schedulesData);
          
          // Ensure we're accessing the correct data structure
          const schedulesArray = Array.isArray(schedulesData.data?.data) ? schedulesData.data.data :
                               Array.isArray(schedulesData.data) ? schedulesData.data :
                               Array.isArray(schedulesData) ? schedulesData : [];
          
          console.log('Schedules Array:', schedulesArray);

          // Transform the data to ensure each schedule has a unique ID
          const transformedSchedules = schedulesArray.map((schedule: any, index: number) => ({
            _id: schedule._id || schedule.id || `schedule-${index}-${Math.random().toString(36).substr(2, 9)}`,
            className: schedule.className || '',
            day: schedule.day || '',
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            location: schedule.location || '',
            instructor: schedule.instructor || ''
          }));
          
          console.log('Transformed Schedules:', transformedSchedules);
          setSchedules(transformedSchedules);
        } else {
          console.error('Failed to fetch schedules:', schedulesResponse.statusText);
          setSchedules([]);
        }

        // Fetch bus timings
        const busResponse = await fetch('http://localhost:5000/api/bus-routes', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });
        if (busResponse.ok) {
          const busData = await busResponse.json();
          console.log('Bus API Response:', busData);
          
          // Ensure we're accessing the correct data structure
          const routesArray = Array.isArray(busData.data?.data) ? busData.data.data :
                             Array.isArray(busData.data?.routes) ? busData.data.routes :
                             Array.isArray(busData.routes) ? busData.routes : [];
          
          console.log('Routes Array:', routesArray);

          // Transform the data to match the BusTiming interface
          const transformedBusTimings = routesArray.map((route: any) => ({
            _id: route._id || route.id || Math.random().toString(36).substr(2, 9),
            route: route.route || route.name || '',
            departureTime: route.time || '',
            arrivalTime: route.arrivalTime || '',
            stops: route.stops || [],
            duration: route.duration || ''
          }));
          
          console.log('Transformed Bus Timings:', transformedBusTimings);
          setBusTimings(transformedBusTimings);
        } else {
          console.error('Failed to fetch bus timings:', busResponse.statusText);
          setBusTimings([]);
        }

        // Fetch events
        const eventsResponse = await fetch('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          console.log('Events API Response:', eventsData);
          
          // Ensure we're accessing the correct data structure
          const eventsArray = Array.isArray(eventsData.data?.data?.upcoming) ? eventsData.data.data.upcoming :
                             Array.isArray(eventsData.data?.upcoming) ? eventsData.data.upcoming :
                             Array.isArray(eventsData.data?.data) ? eventsData.data.data :
                             Array.isArray(eventsData.data) ? eventsData.data : [];
          
          console.log('Events Array:', eventsArray);

          // Transform the data to match the Event interface
          const transformedEvents = eventsArray.map((event: any) => ({
            _id: event._id || event.id || Math.random().toString(36).substr(2, 9),
            title: event.title || event.name || '',
            description: event.description || '',
            date: event.date || '',
            time: event.time || '',
            location: event.location || ''
          }));
          
          console.log('Transformed Events:', transformedEvents);
          setEvents(transformedEvents);
        } else {
          console.error('Failed to fetch events:', eventsResponse.statusText);
          setEvents([]);
        }
      } catch (err: any) {
        console.error('Error in fetchData:', err);
        setError(err.message);
        if (err.message === 'No authentication token found') {
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      console.log('Submitting new schedule:', newSchedule);
      
      const response = await fetch('http://localhost:5000/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newSchedule),
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        setError('Server returned invalid response format');
        return;
      }

      if (response.ok) {
        // Check if the response has the expected structure
        if (responseData.status === 'success' && responseData.data) {
          const newScheduleData = responseData.data.schedule || responseData.data;
          console.log('New schedule to add:', newScheduleData);
          
          // Ensure the new schedule has all required fields
          const transformedSchedule = {
            _id: newScheduleData._id || newScheduleData.id || Math.random().toString(36).substr(2, 9),
            className: newScheduleData.className || newSchedule.className,
            day: newScheduleData.day || newSchedule.day,
            startTime: newScheduleData.startTime || newSchedule.startTime,
            endTime: newScheduleData.endTime || newSchedule.endTime,
            location: newScheduleData.location || newSchedule.location,
            instructor: newScheduleData.instructor || newSchedule.instructor
          };

          setSchedules(prevSchedules => [...prevSchedules, transformedSchedule]);
          setSuccessMessage('Schedule created successfully!');
          setNewSchedule({
            className: '',
            day: 'Monday',
            startTime: '',
            endTime: '',
            location: '',
            instructor: ''
          });
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          console.error('Invalid schedule data format:', responseData);
          setError('Failed to create schedule: Invalid response format');
        }
      } else {
        const errorMessage = responseData.message || responseData.error || 'Unknown error occurred';
        console.error('Failed to create schedule:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        setError(`Failed to create schedule: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError('Failed to create schedule: ' + (error as Error).message);
    }
  };

  // Add handlers for bus timings and events
  const handleAddBusTiming = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Format the time strings
      const formattedDepartureTime = newBusTiming.departureTime ? new Date(`1970-01-01T${newBusTiming.departureTime}`).toLocaleTimeString('en-US', { hour12: false }) : '';
      const formattedArrivalTime = newBusTiming.arrivalTime ? new Date(`1970-01-01T${newBusTiming.arrivalTime}`).toLocaleTimeString('en-US', { hour12: false }) : '';

      const busTimingData = {
        route: newBusTiming.route,
        departureTime: formattedDepartureTime,
        arrivalTime: formattedArrivalTime,
        stops: Array.isArray(newBusTiming.stops) ? newBusTiming.stops : [],
        duration: newBusTiming.duration
      };
      
      console.log('Submitting new bus timing:', busTimingData);
      
      const response = await fetch('http://localhost:5000/api/bus-routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(busTimingData),
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        setError('Server returned invalid response format');
        return;
      }

      if (response.ok) {
        // Check if the response has the expected structure
        if (responseData.status === 'success' && responseData.data) {
          const newBusRoute = responseData.data;
          console.log('New bus route to add:', newBusRoute);
          setBusTimings(prevBusTimings => [...prevBusTimings, newBusRoute]);
          setSuccessMessage('Bus timing created successfully!');
          setNewBusTiming({
            route: '',
            departureTime: '',
            arrivalTime: '',
            stops: [],
            duration: ''
          });
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          console.error('Invalid bus timing data format:', responseData);
          setError('Failed to create bus timing: Invalid response format');
        }
      } else {
        const errorMessage = responseData.message || responseData.error || 'Unknown error occurred';
        console.error('Failed to create bus timing:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        setError(`Failed to create bus timing: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating bus timing:', error);
      if (error instanceof Error) {
        setError('Failed to create bus timing: ' + error.message);
      } else {
        setError('Failed to create bus timing: An unexpected error occurred');
      }
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location
      };
      
      console.log('Submitting new event:', eventData);
      
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
        credentials: 'include'
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        setError('Server returned invalid response format');
        return;
      }

      if (response.ok) {
        // Check if the response has the expected structure
        if (responseData.status === 'success' && responseData.data) {
          const newEventData = responseData.data;
          console.log('New event to add:', newEventData);
          setEvents(prevEvents => [...prevEvents, newEventData]);
          setSuccessMessage('Event created successfully!');
          setNewEvent({
            title: '',
            description: '',
            date: '',
            time: '',
            location: ''
          });
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          console.error('Invalid event data format:', responseData);
          setError('Failed to create event: Invalid response format');
        }
      } else {
        const errorMessage = responseData.message || responseData.error || 'Unknown error occurred';
        console.error('Failed to create event:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        setError(`Failed to create event: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof Error) {
        setError('Failed to create event: ' + error.message);
      } else {
        setError('Failed to create event: An unexpected error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold leading-6 text-gray-900">Admin Dashboard</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage users, schedules, bus timings, and events</p>
          </div>
          <Tabs defaultValue="users" className="p-6">
            <TabsList>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="schedules">Class Schedules</TabsTrigger>
              <TabsTrigger value="bus-timings">Bus Timings</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <TabsContent value="users">
              <div className="mb-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">User Management</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <tr key={user._id || `user-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="schedules">
              <div>
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Schedule</h4>
                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="className" className="block text-sm font-medium text-gray-700">Class Name</label>
                        <input
                          type="text"
                          id="className"
                          value={newSchedule.className}
                          onChange={(e) => setNewSchedule({...newSchedule, className: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="day" className="block text-sm font-medium text-gray-700">Day</label>
                        <select
                          id="day"
                          value={newSchedule.day}
                          onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        >
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                          type="time"
                          id="startTime"
                          value={newSchedule.startTime}
                          onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                          type="time"
                          id="endTime"
                          value={newSchedule.endTime}
                          onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                          type="text"
                          id="location"
                          value={newSchedule.location}
                          onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="instructor" className="block text-sm font-medium text-gray-700">Instructor</label>
                        <input
                          type="text"
                          id="instructor"
                          value={newSchedule.instructor}
                          onChange={(e) => setNewSchedule({...newSchedule, instructor: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add Schedule
                      </button>
                    </div>
                  </form>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Current Schedules</h4>
                  {schedules.length === 0 ? (
                    <p className="text-gray-500">No schedules found. Add a new schedule above.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {schedules.map((schedule, index) => (
                            <tr key={schedule._id || `schedule-${index}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{schedule.className}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{schedule.day}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{schedule.location}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{schedule.instructor}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                <button className="text-red-600 hover:text-red-900">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bus-timings">
              <div>
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Bus Timing</h4>
                  <form onSubmit={handleAddBusTiming} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Route</label>
                        <Input placeholder="Route" value={newBusTiming.route || ''} onChange={e => setNewBusTiming({ ...newBusTiming, route: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                        <Input 
                          type="time" 
                          value={newBusTiming.departureTime || ''} 
                          onChange={e => setNewBusTiming({ ...newBusTiming, departureTime: e.target.value })} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                        <Input 
                          type="time" 
                          value={newBusTiming.arrivalTime || ''} 
                          onChange={e => setNewBusTiming({ ...newBusTiming, arrivalTime: e.target.value })} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (in minutes)</label>
                        <Input 
                          type="number" 
                          placeholder="Duration" 
                          value={newBusTiming.duration || ''} 
                          onChange={e => setNewBusTiming({ ...newBusTiming, duration: e.target.value })} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stops (comma separated)</label>
                        <Input 
                          placeholder="Stops (comma separated)" 
                          value={Array.isArray(newBusTiming.stops) ? newBusTiming.stops.join(', ') : ''} 
                          onChange={e => setNewBusTiming({ 
                            ...newBusTiming, 
                            stops: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                          })} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Add Bus Timing</Button>
                    </div>
                  </form>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Current Bus Timings</h4>
                  {busTimings.length === 0 ? (
                    <p className="text-gray-500">No bus timings found. Add a new bus timing above.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrival</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stops</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {busTimings.map((timing, index) => (
                            <tr key={timing._id || `bus-${index}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{timing.route}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{timing.departureTime}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{timing.arrivalTime}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{timing.duration} minutes</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{Array.isArray(timing.stops) ? timing.stops.join(', ') : 'No stops'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                <button className="text-red-600 hover:text-red-900">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="events">
              <div>
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Event</h4>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <Input placeholder="Event Title" value={newEvent.title || ''} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <Input type="date" value={newEvent.date || ''} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <Input 
                          type="time" 
                          value={newEvent.time || ''} 
                          onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <Input placeholder="Event Location" value={newEvent.location || ''} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <Textarea placeholder="Event Description" value={newEvent.description || ''} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Add Event</Button>
                    </div>
                  </form>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Current Events</h4>
                  {events.length === 0 ? (
                    <p className="text-gray-500">No events found. Add a new event above.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {events.map((event, index) => (
                            <tr key={event._id || `event-${index}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{event.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{event.time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{event.location}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">{event.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                <button className="text-red-600 hover:text-red-900">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 