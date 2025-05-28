import type { ListDto } from "api-client";

type Props = {
	list: ListDto;
};

const TaskList = ({ list }: Props) => {
	const hasTasks = list.taskCount > 0;

	return (
		<div
			className={`rounded-xl px-4 py-3 ${hasTasks ? "bg-teal-800" : "bg-gray-700/40"} transition-colors`}
		>
			<div className="flex justify-between items-center">
				<h2
					className={`text-base font-medium truncate ${hasTasks ? "text-white" : "text-gray-400"}`}
				>
					{list.title}
				</h2>
				<span
					className={`text-sm font-semibold ${hasTasks ? "text-gray-300" : "text-gray-500"} truncate`}
				>
					{list.taskCount}
				</span>
			</div>
		</div>
	);
};

export default TaskList;
