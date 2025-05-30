export type SelectItem = { label: string; value: string };

export type TeacherFormState = {
  // Mandatory fields
  school: string;
  email: string;
  phone_number: string;
  teacher_code: string;
  first_name: string;
  last_name: string;
  gender: string;
  department_code: string;
  phone_number_prefix: string;
  password: string;
  confirm_password: string;

  // Non-mandatory fields
  branch_id?: string;
  teacher_adt_reg_no?: string;
  card_number?: string;
  emergency_number?: string;
  emergency_name?: string;
  marital_status?: string;
  blood_group?: string;
  nominee?: string;
  nominee_relation?: string;
  location?: string;
  location_category?: string;
  organizational_classification?: string;
  organizational_category?: string;
  department_head?: string;
  immediate_reporting?: string;
  teacher_SRA?: string;
  category_type?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  permanent_address?: string;
  branch?: string;
  date_of_birth?: string;
  date_joining?: string;
  date_of_leaving?: string;
  reason?: string;
  teacher_cofirm?: string;
  date_of_retirement?: string;
  department?: string;
  designation?: string;
  grade?: string;
  teacher_adhoc?: string;
  adhaar?: string;
  pancard?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  teacher_disp?: string;
  pension_amount?: string;
  voluntary_provident_fund?: string;
  universal_account_number?: string;
  gov_provident_fund?: string;
  gov_provided_fund_number?: string;
  file_passbook?: string | { name: string };
  file_adhaar_front?: string | { name: string };
  file_adhaar_back?: string | { name: string };
  file_pancard?: string | { name: string };
  form_11?: string | { name: string };
  academic_qualification?: string;
  academic_university?: string;
  specialization?: string;
  passing_year?: string;
  last_school?: string;
  last_designation?: string;
  last_date_of_leaving?: string;
  reference?: string;
  family_name1?: string;
  relation_name1?: string;
  family_age1?: string;
  family_adhaar1?: string;
  status?: string;
};
