import { useEffect, useState } from "react";
import Header from "../components/Header";
import TaskCard from "../components/TaskCard";
import NewTaskModal from "../components/NewTaskModal";
import { TaskItemService, type TaskItemDto } from "api-client";

const Dashboard = () => {
	const [showModal, setShowModal] = useState(false);
	const [tasks, setTasks] = useState<TaskItemDto[]>([]);

	useEffect(() => {
		TaskItemService.getApiTasksUserByUserId({ path: { userId: 1 } }).then(
			(response) => {
				setTasks(response.data!);
			}
		);
	}, []); // empty dependency array = run once on mount

	return (
		<div className="min-h-screen bg-gray-100">
			<Header />
			<main className="p-6">
				<section className="mb-6 flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-gray-800">
							My Tasks
						</h2>
						<p className="text-gray-600">
							Organize and track your tasks easily with Tickway.
						</p>
					</div>
					<button
						onClick={() => setShowModal(true)}
						className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
					>
						New Task
					</button>
				</section>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} />
					))}
				</div>

				{showModal && (
					<NewTaskModal
						onClose={() => setShowModal(false)}
						onTaskCreated={(newTask) => {
							setTasks((prev) => [...prev, newTask]);
							setShowModal(false);
						}}
					/>
				)}
			</main>
		</div>
	);
};

export default Dashboard;
