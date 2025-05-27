import type { ListDto } from "api-client";

type Props = {
	list: ListDto;
};

const TaskList = ({ list }: Props) => {
	return (
		<div className="rounded-2xl p-5 bg-teal-600">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold truncate text-white">
					{list.title}
				</h2>
				<span className="text-base text-blue-200 truncate">
					{list.taskCount}
				</span>
			</div>
		</div>
	);
};

export default TaskList;
