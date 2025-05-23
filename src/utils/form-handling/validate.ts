interface FormCProps {
  values: Record<string, any>;
  removeValidValue?: string[];
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  onSubmitError?: (errors: Record<string, any>) => void;
  selectFields?: string[];
}

import { useState, useEffect } from "react";
export const validation = (
  data: Record<string, any>,
  selectFields: string[] = []
) => {
  let errors: Record<string, any> = {};
  for (const property in data) {
    if (!data[property]?.length && Array.isArray(data[property])) {
      const isSelectField = selectFields.includes(property);
      errors[property] = `Please ${isSelectField ? "select" : "enter"} ${
        property?.split("_")
          ? property?.split("_").join(" ") + "."
          : property + "."
      }`;
    } else if (data[property]?.length && Array.isArray(data[property])) {
      let arrayErrors = [];
      let index = 0;
      for (const propertyArray of data[property]) {
        const arrayError = validation(propertyArray, selectFields);
        index++;
        if (Object.keys(arrayError)?.length) {
          for (let i = 0; i < index - 1; i++) {
            arrayErrors.push({});
          }
          index = 0;
          arrayErrors.push(arrayError);
        }
      }

      if (arrayErrors.length > 0) {
        errors[property] = arrayErrors;
      }
    } else if (typeof data[property] === "object") {
      const objectErrors = validation(data[property], selectFields);
      if (Object.keys(objectErrors)?.length) {
        errors[property] = objectErrors;
      }
    } else {
      errors = {
        ...errors,
        ...inputValidation(data, property, selectFields),
      };
    }
  }
  return errors;
};

export const onKeyPress = (
  evt: React.KeyboardEvent<HTMLInputElement>,
  reg: RegExp
) => {
  if (
    evt.key === "Backspace" ||
    evt.key === "Tab" ||
    evt.key === "ArrowLeft" ||
    evt.key === "ArrowRight" ||
    evt.key === "Delete" ||
    evt.ctrlKey ||
    evt.metaKey
  ) {
    return;
  }

  const key = evt.key;
  const regex = reg ? reg : /^[0-9\b]+$/;
  if (!regex.test(key)) {
    evt.preventDefault();
  }
};

const inputValidation = (
  data: Record<string, any>,
  property: string,
  selectFields: string[] = []
) => {
  const errors: any = {};
  if (
    data[property] === null ||
    data[property] === undefined ||
    !data[property].toString().trim().length
  ) {
    errors[property] = `Please ${
      selectFields.includes(property)
        ? "select"
        : property.includes("photo") ||
          property.includes("logo") ||
          property.includes("file_passbook") ||
          property.includes("file_adhaar") ||
          property.includes("file_pancard") ||
          property.includes("form_11")
        ? "upload"
        : "enter"
    } ${
      property === "email"
        ? "email address."
        : property.replace(/_/g, " ") + "."
    }`;
  }

  if (property.includes("website") && data[property]?.trim().length) {
    const regex = /^(http|https):\/\/[^ "]+$/;
    if (!regex.test(data[property])) {
      errors[property] = "Please enter valid website URL.";
    }
  }

  if (property.includes("email") && data[property]?.trim().length) {
    if (ValidateEmailAddress(data[property])) {
      errors[property] = ValidateEmailAddress(data[property]);
    }
  }
  if (property.includes("phone") && data[property]?.trim().length) {
    if (data[property]?.length < 10) {
      errors[property] = "Phone number must have at least 10 digits.";
    }
  }
  if (property.includes("delivery_number") && data[property]?.length) {
    if (data[property]?.length != 8) {
      errors[property] = "Phone number must have exactly 8 digits.";
    }
  }
  if (
    (property === "password" || property === "new_password") &&
    data[property].trim().length
  ) {
    if (passwordCheck(data[property])) {
      errors[property] = passwordCheck(data[property]);
    }
  }
  if (
    property === "confirm_password" &&
    data["confirm_password"]?.trim().length
  ) {
    if (data["confirm_password"] !== data["password"]) {
      errors["confirm_password"] =
        "Password does not match. Please make sure they match.";
    } else {
      delete errors["confirm_password"];
    }
  }
  if (
    property === "confirm_new_password" &&
    data["confirm_password"]?.trim().length
  ) {
    if (data["confirm_new_password"] !== data["new_password"]) {
      errors["confirm_new_password"] =
        "Password does not match. Please make sure they match.";
    } else {
      delete errors["confirm_new_password"];
    }
  }
  if (property === "hr_email" && data[property]?.length) {
    if (ValidateEmailAddress(data[property])) {
      errors[property] = ValidateEmailAddress(data[property]);
    }
  }
  return errors;
};
export const passwordCheck = (password: string) => {
  if (password.length < 8) return "Password must have minimum of 8 characters.";
  const regex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[^\w\d\s]).{8,}$/;
  if (!regex.test(password))
    return "Password must include at least 8 characters, with at least one uppercase letter, one lowercase letter, one number, and one special character.";
};
export const ValidateEmailAddress = (emailString: string) => {
  if (!emailString) return "Please enter email";
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!regex.test(emailString))
    return "Your email is incorrect. Please try again";
};
export const FormC = ({
  values,
  removeValidValue,
  onSubmit,
  onSubmitError,
  selectFields = [],
}: FormCProps) => {
  const [err, setErr] = useState<any>({});
  const [stateParam, setStateParam] = useState({ ...values });
  useEffect(() => {
    if ((values && JSON.stringify(values)) !== JSON.stringify(stateParam)) {
      setStateParam(values);
    }
  }, [values]);

  const removeAllError = () => {
    setErr({});
  };
  const handleSubmit = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.FormEvent<HTMLFormElement>
      | undefined
  ) => {
    e?.preventDefault();
    const data = removeFormValidation(stateParam);
    const error = validation(data, selectFields);

    setErr(error);
    if (!Object?.keys(error)?.length) {
      setErr({});
      onSubmit(e as React.FormEvent<HTMLFormElement>);
    } else {
      onSubmitError && onSubmitError(error);
      const err = Object.keys(error);
      if (err.length) {
        const input =
          document.querySelector(`input[name=${err[0]}]`) ||
          document.querySelector(`select[name=${err[0]}]`);

        input?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }
  };
  const handleNewError = (error: Record<string, any>) => {
    if (Object.keys(error)?.length) {
      const firstKey = Object.keys(error)[0];
      const input =
        document.querySelector(`input[name=${firstKey}]`) ||
        document.querySelector(`select[name=${firstKey}]`);
      input?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
    setErr({ ...error });
  };
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const state = {
      ...stateParam,
      [name]: value,
    };
    setStateParam(state);
    if (value?.length) {
      const data = removeFormValidation({ [name]: value });
      if (!Object?.keys(data)?.length) {
        let error = validation(state);
        setErr(error);
      }
    }
  };
  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: string
  ) => {
    const { name, value } = e?.target || {};
    let state = {
      [name]: value,
    };
    if (value?.length) {
      let error = validation(state);
      setErr({
        [type]: [error],
      });
    } else {
      setErr({});
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e?.target || {};
    let state = {
      [name]: value,
    };
    const data = removeFormValidation({ [name]: value });
    if (Object?.keys(data)?.length) {
      if (value?.length) {
        var stateparam = {
          ...state,
        };
        if (name === "confirm_password") {
          stateparam = {
            ...stateparam,
            password: stateParam?.password,
          };
        }
        let error = validation(stateparam);
        setErr(error);
      } else {
        setErr({});
      }
    }
  };
  const removeFormValidation = (stateUpdate: Record<string, any>) => {
    let d = { ...stateUpdate };
    if (removeValidValue?.length) {
      for (let name in d) {
        if (removeValidValue?.includes(name)) {
          delete d[name];
        }
      }
    }
    return d;
  };

  const handleDateTimeSlots = (
    values: {
      school?: string;
      class?: string;
      date?: string;
      schedule: {
        start_time?: string;
        end_time?: string;
        teacher?: string;
        subject?: string;
      }[];
    },
    isSubmit = false
  ) => {
    if (isSubmit) {
      removeAllError();
    }

    let errors = { ...err };

    // Initial step -> check for items present outside of array
    if (!values.school && isSubmit) {
      errors.school = "Please select school.";
    } else if (errors?.school && values.school) {
      delete errors.school;
    }
    if (!values.class && isSubmit) {
      errors.class = "Please select class.";
    } else if (errors?.class && values.class) {
      delete errors.class;
    }
    if (!values.date && isSubmit) {
      errors.date = "Please select date.";
    } else if (errors?.date && values.date) {
      delete errors.date;
    }

    const schedule = values.schedule;
    errors.schedule = errors?.schedule || [];

    // check for array
    for (let i = 0; i < schedule.length; i++) {
      errors.schedule.push({});
      if (!schedule[i].start_time && isSubmit) {
        errors["schedule"][i].start_time = "Please select start time.";
      } else if (
        errors?.["schedule"]?.[i]?.start_time &&
        schedule[i].start_time
      ) {
        delete errors?.["schedule"]?.[i]?.start_time;
      }

      if (!schedule[i].end_time && isSubmit) {
        errors["schedule"][i].end_time = "Please select end time.";
      } else if (errors?.["schedule"]?.[i]?.end_time && schedule[i].end_time) {
        delete errors?.["schedule"]?.[i]?.end_time;
      }

      if (!schedule[i].teacher && isSubmit) {
        errors["schedule"][i].teacher = "Please select teacher.";
      } else if (errors?.["schedule"]?.[i]?.teacher && schedule[i].teacher) {
        delete errors?.["schedule"]?.[i]?.teacher;
      }

      if (!schedule[i].subject && isSubmit) {
        errors["schedule"][i].subject = "Please select subject.";
      } else if (errors?.["schedule"]?.[i]?.subject && schedule[i].subject) {
        delete errors?.["schedule"]?.[i]?.subject;
      }
    }

    // Loop through all schedule object and check if any error is present, if not remove that object.
    let errorPresent = false;
    for (let i = 0; i < errors.schedule.length; i++) {
      if (Object.keys(errors.schedule[i]).length > 0) {
        errorPresent = true;
        break;
      }
    }

    // remove schedule key when no object present
    if (!errorPresent) {
      delete errors.schedule;
    }

    setErr(errors);

    if (Object.keys(errors).length === 0 && isSubmit) {
      onSubmit();
    }
  };

  const handleWeekTimeSlots = (
    values: {
      school?: string;
      class?: string;
      [key: string]: any;
    },
    isSubmit = false
  ) => {
    if (isSubmit) {
      removeAllError();
    }
    let errors = { ...err };

    // Initial step -> check for items present outside of array
    if (!values.school && isSubmit) {
      errors.school = "Please select school.";
    } else if (errors?.school && values.school) {
      delete errors.school;
    }
    if (!values.class && isSubmit) {
      errors.class = "Please select class.";
    } else if (errors?.class && values.class) {
      delete errors.class;
    }

    const weekDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    errors.schedule = {};

    for (let day of weekDays) {
      errors.schedule[day] = errors.schedule[day] || [];

      if (
        !values[day] ||
        !Array.isArray(values[day]) ||
        values[day].length === 0
      ) {
        if (isSubmit) {
          // errors.schedule[day] = [{ error: "Please provide schedule data for " + day }];
        }
        continue;
      }

      const schedule = values[day];

      // check for array
      for (let i = 0; i < schedule.length; i++) {
        errors.schedule[day].push({});
        if (!schedule[i].start_time && isSubmit) {
          errors.schedule[day][i].start_time = "Please select start time.";
        } else if (
          errors?.schedule?.[day]?.[i]?.start_time &&
          schedule[i].start_time
        ) {
          delete errors.schedule[day][i].start_time;
        }

        if (!schedule[i].end_time && isSubmit) {
          errors.schedule[day][i].end_time = "Please select end time.";
        } else if (
          errors?.schedule?.[day]?.[i]?.end_time &&
          schedule[i].end_time
        ) {
          delete errors.schedule[day][i].end_time;
        }

        if (!schedule[i].teacher && isSubmit) {
          errors.schedule[day][i].teacher = "Please select teacher.";
        } else if (
          errors?.schedule?.[day]?.[i]?.teacher &&
          schedule[i].teacher
        ) {
          delete errors.schedule[day][i].teacher;
        }

        if (!schedule[i].subject && isSubmit) {
          errors.schedule[day][i].subject = "Please select subject.";
        } else if (
          errors?.schedule?.[day]?.[i]?.subject &&
          schedule[i].subject
        ) {
          delete errors.schedule[day][i].subject;
        }
      }

      let errorPresent = false;
      for (let i = 0; i < errors.schedule[day].length; i++) {
        if (Object.keys(errors.schedule[day][i]).length > 0) {
          errorPresent = true;
          break;
        }
      }

      // remove schedule key when no object present for the day
      if (!errorPresent) {
        delete errors.schedule[day];
      }
    }

    // remove schedule key when no errors are present for any day
    if (Object.keys(errors.schedule).length === 0) {
      delete errors.schedule;
    }

    setErr(errors);

    if (Object.keys(errors).length === 0 && isSubmit) {
      onSubmit();
      return;
    }

    if (errors?.schedule) {
      if (
        Object.values(errors?.schedule).every(
          (item: any) => item.length === 0
        ) &&
        isSubmit &&
        !errors.school &&
        !errors.class
      ) {
        onSubmit();
      }
    }
  };

  const obj = {
    handleBlur,
    removeFormValidation,
    handleChange,
    handleSubmit,
    handleNewError,
    handleArrayChange,
    removeAllError,
    handleDateTimeSlots,
    handleWeekTimeSlots,
    errors: err,
  };
  return obj;
};
