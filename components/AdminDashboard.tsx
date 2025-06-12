import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

interface Schedule {
  _id: string;
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

interface BusRoute {
  route: string;
  schedule: string[];
  duration: string;
}

interface NewSchedule {
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  location: string;
  instructor: string;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('schedules');
  const { toast } = useToast();

  // Schedule Management
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    className: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    location: '',
    instructor: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Event Management
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  // Bus Route Management
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>([]);
  const [newBusRoute, setNewBusRoute] = useState<Partial<BusRoute>>({
    route: '',
    schedule: [],
    duration: ''
  });

  // Check if user is admin
  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log('User data:', data);
      setIsAdmin(data.data.data.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    if (!isAdmin) {
      console.log('User is not an admin, skipping schedule fetch');
      return;
    }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schedules`;
      console.log('Fetching schedules from:', apiUrl);
      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch schedules: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Raw API response:', data);
      
      if (!data.data || !data.data.data) {
        console.error('Invalid data structure received:', data);
        throw new Error('Invalid data structure received from API');
      }

      console.log('Setting schedules:', data.data.data);
      setSchedules(data.data.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch schedules',
        variant: 'destructive'
      });
    }
  };

  // Check admin status and fetch schedules when component mounts
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Fetch schedules when admin status is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetchSchedules();
    }
  }, [isAdmin]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p>You must be an admin to access this page.</p>
      </div>
    );
  }

  const handleAddSchedule = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newSchedule)
      });

      if (!response.ok) throw new Error('Failed to add schedule');

      const data = await response.json();
      setSchedules([...schedules, data.data.data]);
      setNewSchedule({
        className: '',
        day: 'Monday',
        startTime: '',
        endTime: '',
        location: '',
        instructor: ''
      });
      toast({
        title: 'Success',
        description: 'Schedule added successfully'
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to add schedule',
        variant: 'destructive'
      });
    }
  };

  const handleAddEvent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newEvent)
      });

      if (!response.ok) throw new Error('Failed to add event');

      const data = await response.json();
      setEvents([...events, data]);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        description: ''
      });
      toast({
        title: 'Success',
        description: 'Event added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add event',
        variant: 'destructive'
      });
    }
  };

  const handleAddBusRoute = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bus-routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newBusRoute)
      });

      if (!response.ok) throw new Error('Failed to add bus route');

      const data = await response.json();
      setBusRoutes([...busRoutes, data]);
      setNewBusRoute({
        route: '',
        schedule: [],
        duration: ''
      });
      toast({
        title: 'Success',
        description: 'Bus route added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add bus route',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/schedules/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      // Remove the deleted schedule from the state
      setSchedules(schedules.filter(schedule => schedule._id !== id));
      
      toast({
        title: 'Success',
        description: 'Schedule deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedules">Class Schedules</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="bus-routes">Bus Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Add New Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Class Name"
                  value={newSchedule.className}
                  onChange={(e) => setNewSchedule({...newSchedule, className: e.target.value})}
                />
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
                <Button onClick={handleAddSchedule}>Add Schedule</Button>
              </div>
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

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
                <Input
                  placeholder="Location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                />
                <Textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
                <Button onClick={handleAddEvent}>Add Event</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bus-routes">
          <Card>
            <CardHeader>
              <CardTitle>Add New Bus Route</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Route"
                  value={newBusRoute.route}
                  onChange={(e) => setNewBusRoute({...newBusRoute, route: e.target.value})}
                />
                <Textarea
                  placeholder="Schedule (one time per line)"
                  value={newBusRoute.schedule?.join('\n')}
                  onChange={(e) => setNewBusRoute({
                    ...newBusRoute,
                    schedule: e.target.value.split('\n').filter(Boolean)
                  })}
                />
                <Input
                  placeholder="Duration"
                  value={newBusRoute.duration}
                  onChange={(e) => setNewBusRoute({...newBusRoute, duration: e.target.value})}
                />
                <Button onClick={handleAddBusRoute}>Add Bus Route</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 