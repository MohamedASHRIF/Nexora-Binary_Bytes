"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminQuizEntry from './AdminQuizEntry';

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
  degree: string;
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
    instructor: '',
    degree: 'IT' // Default to IT
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
      setIsLoading(true);
      setError('');
      try {
        const token = Cookies.get('token') || localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch users
        console.log('Fetching users...');
        const usersResponse = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        console.log('Users response status:', usersResponse.status);
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
          _id: user._id || user.id || `user-${index}-${Math.random().toString(36).substr(2, 9)}`,
          name: user.name || '',
          email: user.email || '',
          role: user.role || '',
          createdAt: user.createdAt || new Date().toISOString()
        }));

        console.log('Transformed Users:', transformedUsers);
        setUsers(transformedUsers);

        // Fetch schedules
        console.log('Fetching schedules...');
        const schedulesResponse = await fetch('http://localhost:5000/api/schedules', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include'
        });

        console.log('Schedules Response Status:', schedulesResponse.status);
        
        if (schedulesResponse.ok) {
          const schedulesData = await schedulesResponse.json();
          console.log('Raw Schedules API Response:', schedulesData);
          
          // Access the schedules array from the correct data structure
          const schedulesArray = schedulesData.data?.schedules || [];
          
          console.log('Schedules Array:', schedulesArray);

          // Transform the data to ensure each schedule has a unique ID
          const transformedSchedules = schedulesArray.map((schedule: any) => ({
            _id: schedule._id || schedule.id,
            className: schedule.className || '',
            day: schedule.day || '',
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            location: schedule.location || '',
            instructor: schedule.instructor || '',
            degree: schedule.degree || ''
          }));
          
          console.log('Transformed Schedules:', transformedSchedules);
          setSchedules(transformedSchedules);
        } else {
          console.error('Failed to fetch schedules:', schedulesResponse.statusText);
          const errorData = await schedulesResponse.json().catch(() => null);
          console.error('Error details:', errorData);
          setSchedules([]);
          setError('Failed to fetch schedules. Please try again later.');
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
            departureTime: route.schedule || route.time || '',
            arrivalTime: '',
            stops: [],
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
          
          // Access the events array from the correct data structure
          const eventsArray = eventsData.data?.events || [];
          
          console.log('Events Array:', eventsArray);

          // Transform the data to match the Event interface
          const transformedEvents = eventsArray.map((event: any) => ({
            _id: event._id || event.id,
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
            instructor: newScheduleData.instructor || newSchedule.instructor,
            degree: newScheduleData.degree || newSchedule.degree
          };

          setSchedules(prevSchedules => [...prevSchedules, transformedSchedule]);
          setSuccessMessage('Schedule created successfully!');
          setNewSchedule({
            className: '',
            day: 'Monday',
            startTime: '',
            endTime: '',
            location: '',
            instructor: '',
            degree: 'IT'
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
        schedule: formattedDepartureTime,
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
        if (responseData.status === 'success' && responseData.data && responseData.data.route) {
          const newBusRoute = responseData.data.route;
          console.log('New bus route to add:', newBusRoute);
          
          // Transform the response to match the BusTiming interface
          const transformedBusTiming = {
            _id: newBusRoute._id,
            route: newBusRoute.name || newBusRoute.route,
            departureTime: newBusRoute.time,
            arrivalTime: '',
            stops: [],
            duration: newBusRoute.duration
          };
          
          setBusTimings(prevBusTimings => [...prevBusTimings, transformedBusTiming]);
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

  const handleDeleteSchedule = async (id: string) => {
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      // Remove the deleted schedule from state
      setSchedules(schedules.filter(schedule => schedule._id !== id));
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBusTiming = async (id: string) => {
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/bus-routes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete bus timing');
      }

      // Remove the deleted bus timing from state
      setBusTimings(busTimings.filter(timing => timing._id !== id));
      toast({
        title: "Success",
        description: "Bus timing deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting bus timing:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete bus timing",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Remove the deleted event from state
      setEvents(events.filter(event => event._id !== id));
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove the deleted user from state
      setUsers(users.filter(user => user._id !== id));
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-gray-600">Please wait while we fetch the data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="schedules">Class Schedules</TabsTrigger>
          <TabsTrigger value="bus-timings">Bus Timings</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <p className="text-sm text-gray-500">Total users: {users.length}</p>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No users found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Role</th>
                        <th className="text-left p-2">Joined</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id} className="border-t">
                          <td className="p-2">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Add New Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <Input
                    placeholder="Class Name"
                    value={newSchedule.className}
                    onChange={(e) => setNewSchedule({...newSchedule, className: e.target.value})}
                  />
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newSchedule.degree}
                    onChange={(e) => setNewSchedule({...newSchedule, degree: e.target.value})}
                  >
                    <option value="IT">IT</option>
                    <option value="AI">AI</option>
                    <option value="Design">Design</option>
                  </select>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newSchedule.day}
                    onChange={(e) => setNewSchedule({...newSchedule, day: e.target.value as 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'})}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                  </select>
                  <Input
                    placeholder="Start Time (e.g., 09:00)"
                    value={newSchedule.startTime}
                    onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                  />
                  <Input
                    placeholder="End Time (e.g., 10:30)"
                    value={newSchedule.endTime}
                    onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                  />
                  <Input
                    placeholder="Location"
                    value={newSchedule.location}
                    onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                  />
                  <Input
                    placeholder="Instructor"
                    value={newSchedule.instructor}
                    onChange={(e) => setNewSchedule({...newSchedule, instructor: e.target.value})}
                  />
                </div>
                <Button onClick={handleScheduleSubmit}>Add Schedule</Button>
              </form>
            </CardContent>
          </Card>

          {/* Display existing schedules */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Class Schedules</CardTitle>
              <p className="text-sm text-gray-500">Total schedules: {schedules.length}</p>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No schedules found. Add a new schedule to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Day</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Class</th>
                        <th className="text-left p-2">Location</th>
                        <th className="text-left p-2">Instructor</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((schedule) => (
                        <tr key={schedule._id} className="border-t">
                          <td className="p-2">{schedule.day}</td>
                          <td className="p-2">{`${schedule.startTime} - ${schedule.endTime}`}</td>
                          <td className="p-2">{schedule.className}</td>
                          <td className="p-2">{schedule.location}</td>
                          <td className="p-2">{schedule.instructor}</td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bus-timings">
          <Card>
            <CardHeader>
              <CardTitle>Add New Bus Timing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Route"
                  value={newBusTiming.route || ''}
                  onChange={(e) => setNewBusTiming({ ...newBusTiming, route: e.target.value })}
                />
                <Input
                  placeholder="Departure Time (e.g., 09:00)"
                  value={newBusTiming.departureTime || ''}
                  onChange={(e) => setNewBusTiming({ ...newBusTiming, departureTime: e.target.value })}
                />
                <Input
                  placeholder="Arrival Time (e.g., 10:30)"
                  value={newBusTiming.arrivalTime || ''}
                  onChange={(e) => setNewBusTiming({ ...newBusTiming, arrivalTime: e.target.value })}
                />
                <Input
                  placeholder="Duration (in minutes)"
                  value={newBusTiming.duration || ''}
                  onChange={(e) => setNewBusTiming({ ...newBusTiming, duration: e.target.value })}
                />
                <Input
                  placeholder="Stops (comma separated)"
                  value={Array.isArray(newBusTiming.stops) ? newBusTiming.stops.join(', ') : ''}
                  onChange={(e) => setNewBusTiming({ 
                    ...newBusTiming, 
                    stops: e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                  })}
                />
                <Button onClick={handleAddBusTiming}>Add Bus Timing</Button>
              </div>
            </CardContent>
          </Card>

          {/* Display existing bus timings */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Bus Timings</CardTitle>
              <p className="text-sm text-gray-500">Total bus timings: {busTimings.length}</p>
            </CardHeader>
            <CardContent>
              {busTimings.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No bus timings found. Add a new bus timing to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Route</th>
                        <th className="text-left p-2">Departure</th>
                        <th className="text-left p-2">Arrival</th>
                        <th className="text-left p-2">Duration</th>
                        <th className="text-left p-2">Stops</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {busTimings.map((timing) => (
                        <tr key={timing._id} className="border-t">
                          <td className="p-2">{timing.route}</td>
                          <td className="p-2">{timing.departureTime}</td>
                          <td className="p-2">{timing.arrivalTime}</td>
                          <td className="p-2">{timing.duration} minutes</td>
                          <td className="p-2">{Array.isArray(timing.stops) ? timing.stops.join(', ') : 'No stops'}</td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteBusTiming(timing._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Event Title"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <Input
                  placeholder="Date"
                  type="date"
                  value={newEvent.date || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
                <Input
                  placeholder="Time"
                  type="time"
                  value={newEvent.time || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
                <Input
                  placeholder="Location"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
                <Button onClick={handleAddEvent}>Add Event</Button>
              </div>
            </CardContent>
          </Card>

          {/* Display existing events */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>All Events</CardTitle>
              <p className="text-sm text-gray-500">Total events: {events.length}</p>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No events found. Add a new event to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Title</th>
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Location</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event._id} className="border-t">
                          <td className="p-2">{event.title}</td>
                          <td className="p-2">{event.date}</td>
                          <td className="p-2">{event.time}</td>
                          <td className="p-2">{event.location}</td>
                          <td className="p-2">{event.description}</td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEvent(event._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <AdminQuizEntry />
        </TabsContent>
      </Tabs>
    </div>
  );
} 