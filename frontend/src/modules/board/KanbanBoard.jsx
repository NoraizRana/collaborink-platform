// frontend/src/modules/board/KanbanBoard.jsx
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import boardApi from '../../services/boardApi';
import { initSocket, joinRoom, leaveRoom, on, off, emit } from '../../services/socket';
import api from '../../services/api';
import TaskCard from './TaskCard';

export default function KanbanBoard({ projectId }) {
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]); // array of tasks

  useEffect(() => {
    initSocket();
    const room = `project:${projectId}`;
    joinRoom(room);

    on('board:updated', (updated) => setBoard(updated));
    on('task:moved', () => {
      fetchTasks();
      fetchBoard();
    });

    fetchBoard();
    fetchTasks();

    return () => {
      off('board:updated');
      off('task:moved');
      leaveRoom(room);
    };
  }, [projectId]);

  async function fetchBoard() {
    try {
      const res = await boardApi.getBoard(projectId);
      setBoard(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchTasks() {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  const groupedTasks = (columnId) => tasks.filter(t => (t.column || t.columnId || '')?.toString() === columnId.toString());

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Update task on backend (adjust endpoint if different)
    try {
      await api.put(`/tasks/${draggableId}`, {
        column: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      console.error('task update failed', err);
    }

    // Notify board service
    try {
      await boardApi.taskMoved(projectId, {
        taskId: draggableId,
        fromColumnId: source.droppableId,
        toColumnId: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      console.error('board taskMoved failed', err);
    }

    // Emit socket
    emit('task:moved', {
      room: `project:${projectId}`,
      taskId: draggableId,
      fromColumnId: source.droppableId,
      toColumnId: destination.droppableId,
      position: destination.index,
    });

    // local refresh
    fetchBoard();
    fetchTasks();
  };

  if (!board) return <div>Loading board...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto">
        {board.columns.sort((a,b)=>a.order-b.order).map((col) => (
          <Droppable droppableId={col._id.toString()} key={col._id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="min-w-[320px] bg-gray-100 rounded p-4"
              >
                <h3 className="font-semibold mb-3">{col.title}</h3>

                {groupedTasks(col._id).length === 0 && (
                  <div className="text-sm text-gray-500 mb-2">No tasks</div>
                )}

                {groupedTasks(col._id).map((t, index) => (
                  <Draggable draggableId={t._id} index={index} key={t._id}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                        <TaskCard task={t} />
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}