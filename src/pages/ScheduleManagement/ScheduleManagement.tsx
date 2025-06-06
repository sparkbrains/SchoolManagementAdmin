import React, { useEffect, useState } from "react";
import styles from "./ScheduleManagement.module.css";
import Layout from "../../components/common/Layout/Layout";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import WeekDay from "../../components/CreateSchedule/WeeklyCalendar/WeekDay";
import DateSchedule from "../../components/CreateSchedule/DateSchedule/DateSchedule";
import Fetch from "../../utils/form-handling/fetch";
import { FormC } from "../../utils/form-handling/validate";
import { arrayString } from "../../utils/form-handling/arrayString";
import Select from "../../components/common/Select/Select";
import { useToast } from "../../contexts/Toast";
import Button from "../../components/common/Button/Button";
import { useAppContext } from "../../contexts/AppContext";
import Modal from "../../components/common/Modal/Modal";
import FullPageLoader from "../../components/common/FullPageLoader/FullPageLoader";
import moment from "moment";
import { SelectItem } from "../../utils/types";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface Time {
  start_time: string;
  end_time: string;
  subject: string;
  teacher: string;
  id?: string;
}

interface Props {
  Monday: Array<Time>;
  Tuesday: Array<Time>;
  Wednesday: Array<Time>;
  Thursday: Array<Time>;
  Friday: Array<Time>;
  Saturday: Array<Time>;
  Sunday: Array<Time>;
}

type ApiResponse = {
  date: string;
  day_of_week: string;
  start_time?: string;
  end_time?: string;
  teacher?: { id: string };
  subject?: { id: string };
  id?: string;
};

const emptyObj = { start_time: "", end_time: "", teacher: "", subject: "" };

// when user selects day
const initialState = {
  Monday: [emptyObj],
  Tuesday: [emptyObj],
  Wednesday: [emptyObj],
  Thursday: [emptyObj],
  Friday: [emptyObj],
  Saturday: [emptyObj],
  Sunday: [emptyObj],
};

// when user selects date
const initialState2 = {
  date: "",
  schedule: [emptyObj],
};

const ScheduleManagement: React.FC = () => {
  const [dayState, setDayState] = useState<Props>(initialState); // when user selects day
  const [dateState, setDateState] = useState<{
    date: string;
    schedule: Time[];
  }>(initialState2); // when user selects date
  const [viewMode, setViewMode] = useState<"date" | "day">("date");
  const [classes, setClasses] = useState<SelectItem[]>([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEmptyStateModal, setShowEmptyStateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [disableEdit, setDisableEdit] = useState(false);
  const [showNoTeacherModal, setNoTeacherModal] = useState("");

  const [parameters, setParamaters] = useState({});
  const [searchParams, setSearchParams] = useSearchParams({});
  const [commonInfo, setCommonInfo] = useState({
    school: searchParams.get("school") || "",
    class_assigned: searchParams.get("class") || "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { schools } = useAppContext();

  const showToast = (message: string) => {
    toast.show(message, 2000, "#4CAF50");
  };

  const convertToDayState = (data: ApiResponse[]) => {
    const result: Record<string, Time[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    data.forEach((entry) => {
      const day = entry.day_of_week;
      if (result[day]) {
        result[day].push({
          start_time: entry.start_time || "",
          end_time: entry.end_time || "",
          teacher: entry.teacher?.id || "",
          subject: entry.subject?.id || "",
          id: entry?.id,
        });
      }
    });

    return result;
  };

  const convertToDateState = (data: { time_slots: ApiResponse[] }) => {
    let convertedFormat: {
      date: string;
      schedule: {
        start_time: string | undefined;
        end_time: string | undefined;
        teacher: string | undefined;
        subject: string | undefined;
        id: string | undefined;
      }[];
    } = {
      date: "",
      schedule: [],
    };
    convertedFormat.date = data?.time_slots?.[0]?.date;
    convertedFormat.schedule = data?.time_slots?.map((item) => {
      return {
        start_time: item?.start_time,
        end_time: item?.end_time,
        teacher: item?.teacher?.id,
        subject: item?.subject?.id,
        id: item?.id,
      };
    });

    return convertedFormat;
  };

  const getScheduleInfo = () => {
    setIsLoading("full-page-loader");
    Fetch(`schedule/${id}`).then((res: any) => {
      if (res.status) {
        let classes = schools
          .find((item) => item?.value === res?.data?.school?.id)
          ?.classes?.map((item) => ({
            label: item?.name + " " + item?.section,
            value: item?.id,
          }));

        if (
          res?.data?.time_slots?.length > 0 &&
          res?.data?.time_slots[0]?.is_deleted
        ) {
          setDisableEdit(true);
        }

        setClasses(classes || []);
        setCommonInfo({
          school: res?.data?.school?.id,
          class_assigned: res?.data?.sch_class?.id,
        });
        getTeachers(res?.data?.school?.id);
        if (res?.data?.time_slots[0]?.day_of_week) {
          // set state for week
          setViewMode("day");
          let convertedFormat = convertToDayState(res?.data?.time_slots);
          setDayState(convertedFormat as any);
        } else {
          // set state for date
          setDateState(convertToDateState(res?.data) as any);
        }
      }
      setIsLoading("");
    });
  };

  const getTeachers = (id: string) => {
    setTeachers([]);
    Fetch(`list-teachers/${id}/`).then((res: any) => {
      if (res.status) {
        let teachers = res.data?.results?.map(
          (item: { name: string; id: string }) => {
            return {
              label: item?.name,
              value: item?.id,
            };
          }
        );
        setTeachers(teachers);
      }
    });
  };

  const addItem = (type: "day" | "date", day: Day = "Monday") => {
    if (type === "day") {
      setDayState((prevState) => {
        return {
          ...prevState,
          [day]: [...prevState[day], { ...emptyObj }],
        };
      });
    } else {
      setDateState((prevState) => {
        return {
          ...prevState,
          schedule: [...prevState.schedule, { ...emptyObj }],
        };
      });
    }
  };

  const handleChange = (
    day: Day,
    index: number,
    type: "start_time" | "end_time" | "subject" | "teacher",
    value: string
  ) => {
    const updatedDay = [...dayState[day]];
    const updatedTime = { ...updatedDay[index], isEdited: id ? true : false };

    updatedTime[type] = value;
    updatedDay[index] = updatedTime;

    const newState = {
      ...dayState,
      [day]: updatedDay,
    };

    setDayState(newState);

    handleWeekTimeSlots({
      ...newState,
      school: commonInfo.school,
      class: commonInfo.class_assigned,
    });
  };

  const handleDelete = (
    index: number,
    type: "day" | "date",
    day: string = "Monday"
  ) => {
    if (type === "day") {
      setDayState((prevState) => {
        const updatedDay = [...prevState[day as keyof Props]];
        updatedDay.splice(index, 1);

        return {
          ...prevState,
          [day]: updatedDay,
        };
      });
    } else {
      setDateState((prevState) => {
        const schedule = [...prevState.schedule];
        schedule.splice(index, 1);
        return {
          ...prevState,
          schedule: schedule,
        };
      });
    }
  };

  useEffect(() => {
    if (id && schools.length > 0) {
      getScheduleInfo();
    }
    if (searchParams.get("school")) {
      let classes = schools
        .find((item) => item?.value === searchParams.get("school"))
        ?.classes?.map((item) => ({
          label: item?.name + " " + item?.section,
          value: item?.id,
        }));

      getTeachers(searchParams.get("school") || "");

      setClasses(classes || []);
    }
  }, [schools]);

  const navigateBack = () => {
    navigate("/schedule");
  };

  const handlecommonInfoChange = (value: string, type: string) => {
    if (type === "school") {
      let classes = schools
        .find((item) => item?.value === value)
        ?.classes?.map((item) => ({
          label: item?.name + " " + item?.section,
          value: item?.id,
        }));

      setClasses(classes || []);
      getTeachers(value);
    }
    setCommonInfo((prevState) => {
      return {
        ...prevState,
        [type]: value,
      };
    });

    const updatedParams = {
      school: type === "school" ? value : commonInfo.school,
      class: type === "class" ? value : commonInfo.class_assigned,
    };

    setSearchParams(updatedParams);

    const key = type === "class_assigned" ? "class" : type;

    if (viewMode === "date") {
      handleDateTimeSlots({ ...dateState, ...commonInfo, [key]: value });
    } else {
      handleWeekTimeSlots({ ...dayState, ...commonInfo, [key]: value });
    }
  };

  const handleTimeChange = (index: number, type: string, val: string) => {
    const updatedSchedule = dateState.schedule.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          [type]: val,
          isEdited: id ? true : false,
        };
      }
      return item;
    });
    let updatedState = {
      ...dateState,
      schedule: updatedSchedule,
    };
    setDateState(updatedState);
    handleDateTimeSlots({
      ...updatedState,
      school: commonInfo.school,
      class: commonInfo.class_assigned,
    });
  };

  const handleCheckValidation = (params: any) => {
    setIsLoading("button");
    Fetch(
      `schedule/${commonInfo.class_assigned}/validate-slots/`,
      { ...params },
      { method: "post" }
    ).then((res: any) => {
      setIsValidated(true);
      setIsLoading("button");
      if (res.status) {
        handleApiCall(params);
      } else {
        let resErr = arrayString(res);
        handleNewError(resErr);
        setShowModal(true);
      }
      setIsLoading("");
    });
  };

  const handleApiCall = (params: any) => {
    if (id) {
      setIsLoading("button");
    } else {
      setIsLoading("modal");
    }

    let url = "";
    if (id) {
      url = `schedule/${id}/`;
    } else {
      url = "schedule/";
    }
    Fetch(
      url,
      { ...params, date: moment().format("YYYY-MM-DD") },
      { method: id ? "put" : "post" }
    ).then((res: any) => {
      if (res.status) {
        showToast(
          id ? "Schedule updated successfully" : "Schedule added successfully"
        );
        navigate("/schedule");
      } else {
        let resErr = arrayString(res);
        handleNewError(resErr);

        if (resErr?.is_conflict) {
          setNoTeacherModal(resErr?.message);
        }
      }
      setIsLoading("");
      setShowModal(false);
    });
  };

  const getDayNumber = (day: string): number | undefined => {
    switch (day) {
      case "Monday":
        return 0;
      case "Tuesday":
        return 1;
      case "Wednesday":
        return 2;
      case "Thursday":
        return 3;
      case "Friday":
        return 4;
      case "Saturday":
        return 5;
      case "Sunday":
        return 6;
      default:
        return undefined;
    }
  };

  const convertForm = (obj: any) => {
    if (viewMode === "day") {
      let object = {
        school: obj.school,
        sch_class: obj.class_assigned,
        time_slots: Object.entries(obj.time_slots).reduce(
          (acc: any, [day, daySlots]: any) => {
            let slots = [...daySlots];
            const slotsForDay = slots.map((slot) => ({
              day_of_week: getDayNumber(day),
              start_time: slot.start_time,
              end_time: slot.end_time,
              teacher: slot.teacher,
              subject: slot.subject,
              id: slot.id,
            }));
            return [...acc, ...slotsForDay];
          },
          [] as {
            day: string;
            type: string;
            start_time: string;
            end_time: string;
          }[]
        ),
      };
      return object;
    } else {
      let slots = [...obj?.time_slots];
      let object = {
        school: obj.school,
        sch_class: obj.class_assigned,
        time_slots: slots.map((item) => {
          return {
            date: obj.date,
            start_time: item.start_time,
            end_time: item.end_time,
            teacher: item.teacher,
            subject: item.subject,
            id: item.id,
          };
        }),
      };
      return object;
    }
  };

  const onSubmit = () => {
    let params: any = {};

    if (viewMode === "date") {
      params = {
        ...commonInfo,
        ...dateState,
        schedule_type: viewMode,
        time_slots: dateState.schedule,
      };
      delete params.schedule;
    } else {
      params = {
        ...commonInfo,
        schedule_type: "week",
        time_slots: dayState,
      };
    }

    params = convertForm(params);

    setParamaters(params);

    if (!isValidated && !id) {
      handleCheckValidation(params);
    } else {
      handleApiCall(params);
    }
  };

  const changeViewMode = (type: "date" | "day") => {
    if (id) {
      return;
    }
    setViewMode(type);
    removeAllError();
  };

  const selectFields = [
    "school",
    "class_assigned",
    "start_time",
    "end_time",
    "teacher",
    "subject",
    "date",
    "class",
  ];

  let params = {
    school: commonInfo.school,
    class: commonInfo.class_assigned,
  };

  let dayParams = { ...dayState };
  [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].forEach((day) => {
    if (
      Array.isArray(dayParams[day as keyof Props]) &&
      dayParams[day as keyof Props].length === 0
    ) {
      delete dayParams[day as keyof Props];
    }
  });

  const replicateDay = (replicateTo: string, replicateFrom: string) => {
    setDayState((prevState) => {
      return {
        ...prevState,
        [replicateTo]: prevState[replicateFrom as keyof Props].map((item) => {
          const { id, ...rest } = item;
          return { ...rest, isEdited: true };
        }),
      };
    });

    handleWeekTimeSlots({
      ...dayState,
      school: commonInfo.school,
      class: commonInfo.class_assigned,
      [replicateTo]: dayState[replicateFrom as keyof Props].map((item) => {
        return { ...item, isEdited: id ? true : false };
      }),
    });
  };

  const {
    errors,
    handleNewError,
    removeAllError,
    handleDateTimeSlots,
    handleWeekTimeSlots,
  } = FormC({
    values:
      viewMode === "day"
        ? { ...dayParams, ...params }
        : { ...dateState, ...params },
    onSubmit,
    selectFields,
  });

  const deleteItem = () => {
    setIsLoading("delete-modal");
    Fetch(`time-slot/${deleteId}/`, {}, { method: "delete" }).then(
      (res: any) => {
        if (res.status) {
          showToast("Slot deleted successfully");
          setDeleteId(null);

          if (viewMode === "day") {
            let slotsPresent = 0;

            for (const item of Object.values(dayState)) {
              for (let i = 0; i < item.length; i++) {
                slotsPresent++;
              }

              if (slotsPresent > 1) {
                break;
              }
            }

            if (slotsPresent === 1) {
              navigate("/schedule");
              return;
            }

            setDayState((prevState) => {
              const updatedDay = { ...prevState };
              Object.entries(updatedDay).forEach(([key, value]) => {
                updatedDay[key as keyof Props] = value.filter(
                  (item) => item.id !== deleteId
                );
              });

              return updatedDay;
            });
          } else {
            if (dateState.schedule.length === 1) {
              navigate("/schedule");
              return;
            }
            setDateState((prevState) => {
              const updatedSchedule = prevState.schedule.filter(
                (item) => item.id !== deleteId
              );
              return { ...prevState, schedule: updatedSchedule };
            });
          }
        }
        setIsLoading("");
      }
    );
  };

  const allowLastEntryDelete = () => {
    let count = 0;
    Object.entries(dayState).forEach(([_, value]) => {
      count += value?.length;
    });

    if (id) {
      return true;
    }

    if (count === 1) {
      return false;
    }

    return true;
  };

  return (
    <Layout>
      {isLoading === "full-page-loader" ? (
        <FullPageLoader visible={true} />
      ) : (
        <form
          action=""
          onSubmit={() => {
            if (viewMode === "date") {
              handleDateTimeSlots(
                {
                  ...dateState,
                  school: commonInfo.school,
                  class: commonInfo.class_assigned,
                },
                true
              );
            } else {
              handleWeekTimeSlots({
                ...dayState,
                school: commonInfo.school,
                class: commonInfo.class_assigned,
              });
            }
          }}
        >
          <div className={styles.container}>
            <h2>
              {id ? (disableEdit ? "Deleted" : "Update") : "Create"} Schedule
            </h2>
            <div className={`${styles.selectContainer} mt-4`}>
              <Select
                label="Select school*"
                options={schools}
                value={commonInfo?.school}
                onChange={(value: string) =>
                  handlecommonInfoChange(value, "school")
                }
                error={errors?.school}
                disabled={id ? true : false}
              />

              <Select
                label="Select class*"
                options={classes}
                value={commonInfo.class_assigned}
                onChange={(value: string) =>
                  handlecommonInfoChange(value, "class_assigned")
                }
                error={errors?.class}
                disabled={id ? true : false}
              />
            </div>

            <div className={`${styles.viewToggle} mt-3`}>
              <button
                disabled={id ? true : false}
                type="button"
                className={`${styles.toggleButton} ${
                  viewMode === "date" ? styles.active : ""
                }`}
                onClick={() => changeViewMode("date")}
              >
                Date
              </button>
              <button
                disabled={id ? true : false}
                type="button"
                className={`${styles.toggleButton} ${
                  viewMode === "day" ? styles.active : ""
                }`}
                onClick={() => changeViewMode("day")}
              >
                Week
              </button>
            </div>

            {viewMode === "day" ? (
              <>
                {Object.entries(dayState).map(([key, value]) => (
                  <WeekDay
                    dateState={dayState[key as keyof Props]}
                    key={key}
                    day={key}
                    schedule={value}
                    addItem={() => addItem("day", key as Day)}
                    handleChange={(
                      index: number,
                      type: "start_time" | "end_time" | "subject" | "teacher",
                      value: string
                    ) => handleChange(key as Day, index, type, value)}
                    handleDelete={(
                      index: number,
                      id: string | undefined = undefined
                    ) => {
                      if (id) {
                        setDeleteId(id);
                      } else {
                        handleDelete(index, "day", key as Day);
                      }
                    }}
                    errors={errors?.schedule?.[key]}
                    teachers={teachers}
                    replicateDay={replicateDay}
                    disableEdit={disableEdit}
                    allowLastEntryDelete={allowLastEntryDelete()}
                  />
                ))}
              </>
            ) : (
              <DateSchedule
                dateState={dateState}
                handleChange={(value: string, type: string) => {
                  setDateState((prevState) => {
                    return {
                      ...prevState,
                      [type]: value,
                    };
                  });
                  handleDateTimeSlots({
                    ...commonInfo,
                    ...dateState,
                    [type]: value,
                  });
                }}
                handleTimeChange={(
                  index: number,
                  type: "start_time" | "end_time" | "subject" | "teacher",
                  value: string
                ) => handleTimeChange(index, type, value)}
                teachers={teachers}
                errors={errors}
                schedule={dateState.schedule}
                addItem={() => addItem("date")}
                handleDelete={(index: number, id = undefined) => {
                  if (id) {
                    setDeleteId(id);
                  } else {
                    handleDelete(index, "date", "");
                  }
                }}
                isEditMode={!!id}
                disableEdit={disableEdit}
              />
            )}

            {errors?.non_field_errors && (
              <p className="error">{errors?.non_field_errors}</p>
            )}

            {errors?.unauthorized && (
              <p className="error">{errors?.unauthorized}</p>
            )}

            {errors?.internalServerError && (
              <p className="error">{errors?.internalServerError}</p>
            )}

            {!disableEdit && (
              <div className={styles.buttonContainer}>
                <Button
                  text="Cancel"
                  type="outline"
                  onClick={navigateBack}
                  className="mt-2 mr-4"
                  style={{ width: "8rem" }}
                />
                <Button
                  text={id ? "Update" : "Submit"}
                  onClick={() => {
                    if (viewMode === "date") {
                      handleDateTimeSlots(
                        {
                          ...dateState,
                          school: commonInfo.school,
                          class: commonInfo.class_assigned,
                        },
                        true
                      );
                    } else {
                      handleWeekTimeSlots(
                        {
                          ...dayState,
                          school: commonInfo.school,
                          class: commonInfo.class_assigned,
                        },
                        true
                      );
                    }
                  }}
                  className="mt-2"
                  isLoading={isLoading === "button"}
                  style={{ width: "8rem" }}
                />
              </div>
            )}
          </div>
        </form>
      )}

      <Modal
        title="Confirm!"
        message={
          "Are you sure you want to override your previous existing schedule?"
        }
        onConfirm={() => handleApiCall(parameters)}
        onCancel={() => setShowModal(false)}
        visible={showModal}
        isLoading={isLoading === "modal"}
      />
      <Modal
        title="Alert!"
        message={"Please ensure at least one slot has been added."}
        onConfirm={() => setShowEmptyStateModal(false)}
        confirmText="OK"
        visible={showEmptyStateModal}
      />
      <Modal
        title="Confirm!"
        message={"Are you sure you want to delete this time slot?"}
        onConfirm={deleteItem}
        onCancel={() => setDeleteId(null)}
        visible={!!deleteId}
        isLoading={isLoading === "delete-modal"}
        primaryButtonVariant="danger"
      />
      <Modal
        title="Alert!"
        message={showNoTeacherModal}
        onConfirm={() => {
          setNoTeacherModal("");
          removeAllError();
        }}
        confirmText="OK"
        visible={!!showNoTeacherModal}
      />
    </Layout>
  );
};

export default ScheduleManagement;
