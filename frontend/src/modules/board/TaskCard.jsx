// frontend/src/modules/board/TaskCard.jsx

export default function TaskCard({ task }) {
  return (
    <div className="bg-white rounded shadow p-3 mb-2">
      <div className="text-sm font-medium">{task.title}</div>
      <div className="text-xs text-gray-500 mt-1">{task.description}</div>
    </div>
  );
}