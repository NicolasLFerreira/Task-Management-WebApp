import type { ListDto } from "api-client";

type Props = {
	list: ListDto;
};

const TaskList = ({ list }: Props) => {
	const hasTasks = list.taskCount > 0;

	return (
		<div
			className={`rounded-xl px-4 py-3 ${hasTasks ? "bg-teal-800" : "bg-teal-800/50"} transition-colors`}
		>
			<div className="flex justify-between items-center">
				<h2
					className={`text-sm font-medium truncate ${hasTasks ? "text-white" : "text-white/50"}`}
				>
					{list.title}
				</h2>
				<span
					className={`text-sm font-semibold ${hasTasks ? "text-gray-300" : "text-gray-300/50"} truncate`}
				>
					{list.taskCount}
				</span>
			</div>
		</div>
	);
};

export default TaskList;
