import { useParams } from 'react-router-dom'

export default function TripDetailPage() {
  const { tripId } = useParams()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Trip Detail</h1>
      <p className="mt-2 text-gray-600">Viewing trip: {tripId}</p>
    </div>
  )
}
