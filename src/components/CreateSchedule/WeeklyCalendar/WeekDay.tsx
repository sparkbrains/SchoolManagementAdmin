import React, { useState } from "react";
import TimeEntry from "../TimeEntry/TimeEntry";
import { PlusCircleIcon } from "../../../assets/svgs";
import Modal from "../../common/Modal/Modal";
import TextButton from "../../common/TextButton/TextButton";

interface Time {
  start_time: string;
  end_time: string;
  subject: string;
  teacher: string;
  handleChange: (
    type: "start_time" | "end_time" | "subject" | "teacher",
    value: string
  ) => void;
  handleDelete: () => void;
  teachers: Array<{ label: string; value: string }>;
  errors: any;
  id?: string;
}

const previousDay = (day: string) => {
  switch (day) {
    case "Tuesday":
      return "Monday";
    case "Wednesday":
      return "Tuesday";
    case "Thursday":
      return "Wednesday";
    case "Friday":
      return "Thursday";
    case "Saturday":
      return "Friday";
    case "Sunday":
      return "Saturday";

    default:
      return "";
  }
};

type Props = {
  day: string;
  schedule: Array<Time>;
  addItem: () => void;
  handleChange: (
    index: number,
    type: "start_time" | "end_time" | "subject" | "teacher",
    value: string
  ) => void;
  handleDelete: (index: number, id: string | undefined) => void;
  teachers: Array<{ label: string; value: string }>;
  errors: any;
  replicateDay: (replicateTo: string, replicateFrom: string) => void;
  disableEdit: boolean;
  allowLastEntryDelete: boolean;
  dateState: {
    subject: string;
    teacher: string;
    start_time: string;
    end_time: string;
  }[];
};

const WeekDay: React.FC<Props> = ({
  day,
  schedule,
  addItem,
  handleChange,
  handleDelete,
  errors = {},
  teachers,
  replicateDay,
  dateState = [],
  disableEdit,
  allowLastEntryDelete,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="mb-4">
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          className="mt-3"
        >
          <h4>{day}</h4>
          <button
            onClick={addItem}
            style={{
              width: "1.875rem",
              height: "1.875rem",
              border: "none",
              outline: "none",
              background: "none",
              cursor: "pointer",
            }}
            type="button"
            disabled={disableEdit}
          >
            <PlusCircleIcon />
          </button>
        </div>

        {day !== "Monday" && (
          <TextButton
            disabled={disableEdit}
            onClick={() => replicateDay(day, previousDay(day))}
          >
            Same as {previousDay(day)}
          </TextButton>
        )}

        <p className="mt-2">Enter schedule for {day}</p>

        {schedule.map((item, index) => (
          <TimeEntry
            dateArray={{ schedule: dateState }}
            key={index}
            start_time={item.start_time}
            end_time={item.end_time}
            subject={item.subject}
            teacher={item.teacher}
            handleChange={(
              type: "start_time" | "end_time" | "subject" | "teacher",
              value: string
            ) => handleChange(index, type, value)}
            handleDelete={() => handleDelete(index, item?.id)}
            errors={errors?.[index]}
            teachers={teachers}
            minStartTime={index > 0 ? schedule[index - 1].end_time : undefined}
            disabled={disableEdit}
            allowLastEntryDelete={allowLastEntryDelete}
          />
        ))}
        <hr />
      </div>
      <Modal
        title="Alert!"
        message="Please ensure all fields are filled out correctly before adding more time slots."
        onConfirm={() => setShowModal(false)}
        visible={showModal}
        confirmText="OK"
      />
    </>
  );
};

export default WeekDay;
