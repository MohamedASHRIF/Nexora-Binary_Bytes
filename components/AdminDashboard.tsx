import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from './ui/use-toast';

interface Schedule {
  id: string;
  course: string;
  time: string;
  location: string;
  instructor: string;
  days: string[];
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

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('schedules');
  const { toast } = useToast();

  // Schedule Management
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    course: '',
    time: '',
    location: '',
    instructor: '',
    days: []
  });

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
      setSchedules([...schedules, data]);
      setNewSchedule({
        course: '',
        time: '',
        location: '',
        instructor: '',
        days: []
      });
      toast({
        title: 'Success',
        description: 'Schedule added successfully'
      });
    } catch (error) {
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
                  placeholder="Course"
                  value={newSchedule.course}
                  onChange={(e) => setNewSchedule({...newSchedule, course: e.target.value})}
                />
                <Input
                  placeholder="Time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
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