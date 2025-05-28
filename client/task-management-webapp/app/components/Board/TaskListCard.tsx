import type { ListDto } from "api-client";

type Props = {
	list: ListDto;
};

const TaskList = ({ list }: Props) => {
	return (
		<div className={`rounded-2xl p-5 ${list.taskCount !== 0 ? "bg-teal-700" : "bg-teal-800"}`}>
			<div className="flex justify-between items-center">
				<h2 className={`text-xl font-semibold truncate ${list.taskCount !== 0 ? "text-white" : "text-gray-400"}`}>
					{list.title}
				</h2>
				<span className={`text-base font-bold ${list.taskCount !== 0 ? "text-gray-200" : "text-gray-400"} truncate`}>
					{list.taskCount}
				</span>
			</div>
		</div>
	);
};

export default TaskList;
