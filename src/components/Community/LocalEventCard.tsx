
import React from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

interface EventProps {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  imageUrl?: string;
}

export const LocalEventCard: React.FC<EventProps> = ({
  title,
  date,
  time,
  location,
  attendees,
  imageUrl,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden card-hover">
      {imageUrl && (
        <div className="h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" 
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gestalt-purple" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gestalt-purple" />
            <span>{time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gestalt-purple" />
            <span>{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gestalt-purple" />
            <span>{attendees} attending</span>
          </div>
        </div>
        
        <div className="mt-4 flex">
          <button className="btn-primary py-2 px-4 text-sm">Join Event</button>
          <button className="btn-secondary py-2 px-4 text-sm ml-2">Share</button>
        </div>
      </div>
    </div>
  );
};
