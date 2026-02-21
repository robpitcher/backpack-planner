import { useParams } from 'react-router-dom'

export default function TripPlannerPage() {
  const { tripId } = useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Trip Planner</h1>
      <p className="mt-2 text-gray-600">Planning trip: {tripId}</p>
    </div>
  )
}
