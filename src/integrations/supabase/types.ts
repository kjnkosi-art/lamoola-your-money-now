export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_trail: {
        Row: {
          action_type: Database["public"]["Enums"]["audit_action"]
          audit_id: string
          details: Json | null
          ip_address: string | null
          object_id: string | null
          object_type: string
          timestamp: string
          user_id: string | null
          user_role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["audit_action"]
          audit_id?: string
          details?: Json | null
          ip_address?: string | null
          object_id?: string | null
          object_type: string
          timestamp?: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["audit_action"]
          audit_id?: string
          details?: Json | null
          ip_address?: string | null
          object_id?: string | null
          object_type?: string
          timestamp?: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          created_at: string
          eft_account: string | null
          eft_bank: string | null
          eft_branch: string | null
          eft_reference: string | null
          lamoola_alt_name: string | null
          lamoola_legal_name: string | null
          lamoola_notice_address: string | null
          lamoola_notice_email: string | null
          lamoola_registration_number: string | null
          payment_method_primary: string | null
          remittance_due_business_days: number | null
          signatory_date: string | null
          signatory_location: string | null
          signatory_name: string | null
          signatory_title: string | null
          template_id: string
          version: number | null
        }
        Insert: {
          created_at?: string
          eft_account?: string | null
          eft_bank?: string | null
          eft_branch?: string | null
          eft_reference?: string | null
          lamoola_alt_name?: string | null
          lamoola_legal_name?: string | null
          lamoola_notice_address?: string | null
          lamoola_notice_email?: string | null
          lamoola_registration_number?: string | null
          payment_method_primary?: string | null
          remittance_due_business_days?: number | null
          signatory_date?: string | null
          signatory_location?: string | null
          signatory_name?: string | null
          signatory_title?: string | null
          template_id?: string
          version?: number | null
        }
        Update: {
          created_at?: string
          eft_account?: string | null
          eft_bank?: string | null
          eft_branch?: string | null
          eft_reference?: string | null
          lamoola_alt_name?: string | null
          lamoola_legal_name?: string | null
          lamoola_notice_address?: string | null
          lamoola_notice_email?: string | null
          lamoola_registration_number?: string | null
          payment_method_primary?: string | null
          remittance_due_business_days?: number | null
          signatory_date?: string | null
          signatory_location?: string | null
          signatory_name?: string | null
          signatory_title?: string | null
          template_id?: string
          version?: number | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          access_limit_override_percent: number | null
          account_holder_name: string | null
          account_type: Database["public"]["Enums"]["account_type"] | null
          approval_mode: Database["public"]["Enums"]["approval_mode"] | null
          bank_account_number: string | null
          bank_name: string | null
          bank_verification_status: Database["public"]["Enums"]["bank_status"]
          created_at: string
          date_of_birth: string | null
          department: string | null
          email_address: string | null
          employee_id: string
          employee_number: string | null
          employer_id: string
          employment_start_date: string | null
          employment_status:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name: string
          gross_salary: number | null
          id_document_type: Database["public"]["Enums"]["id_doc_type"] | null
          import_source: Database["public"]["Enums"]["import_source"] | null
          last_name: string
          max_transaction_override: number | null
          mobile_number: string | null
          notes: string | null
          pay_cycle: Database["public"]["Enums"]["pay_cycle"] | null
          payday: string | null
          payroll_period_end: string | null
          payroll_period_start: string | null
          sa_id_or_passport: string | null
          status: Database["public"]["Enums"]["employee_status"]
          supervisor_name: string | null
          tcs_accepted: boolean | null
          tcs_accepted_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_limit_override_percent?: number | null
          account_holder_name?: string | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          approval_mode?: Database["public"]["Enums"]["approval_mode"] | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_verification_status?: Database["public"]["Enums"]["bank_status"]
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email_address?: string | null
          employee_id?: string
          employee_number?: string | null
          employer_id: string
          employment_start_date?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name: string
          gross_salary?: number | null
          id_document_type?: Database["public"]["Enums"]["id_doc_type"] | null
          import_source?: Database["public"]["Enums"]["import_source"] | null
          last_name: string
          max_transaction_override?: number | null
          mobile_number?: string | null
          notes?: string | null
          pay_cycle?: Database["public"]["Enums"]["pay_cycle"] | null
          payday?: string | null
          payroll_period_end?: string | null
          payroll_period_start?: string | null
          sa_id_or_passport?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          supervisor_name?: string | null
          tcs_accepted?: boolean | null
          tcs_accepted_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_limit_override_percent?: number | null
          account_holder_name?: string | null
          account_type?: Database["public"]["Enums"]["account_type"] | null
          approval_mode?: Database["public"]["Enums"]["approval_mode"] | null
          bank_account_number?: string | null
          bank_name?: string | null
          bank_verification_status?: Database["public"]["Enums"]["bank_status"]
          created_at?: string
          date_of_birth?: string | null
          department?: string | null
          email_address?: string | null
          employee_id?: string
          employee_number?: string | null
          employer_id?: string
          employment_start_date?: string | null
          employment_status?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          first_name?: string
          gross_salary?: number | null
          id_document_type?: Database["public"]["Enums"]["id_doc_type"] | null
          import_source?: Database["public"]["Enums"]["import_source"] | null
          last_name?: string
          max_transaction_override?: number | null
          mobile_number?: string | null
          notes?: string | null
          pay_cycle?: Database["public"]["Enums"]["pay_cycle"] | null
          payday?: string | null
          payroll_period_end?: string | null
          payroll_period_start?: string | null
          sa_id_or_passport?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          supervisor_name?: string | null
          tcs_accepted?: boolean | null
          tcs_accepted_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["employer_id"]
          },
        ]
      }
      employer_contacts: {
        Row: {
          cellphone: string | null
          contact_id: string
          contact_type: Database["public"]["Enums"]["contact_type"]
          email: string | null
          employer_id: string
          first_name: string
          landline: string | null
          last_name: string
          role_title: string | null
        }
        Insert: {
          cellphone?: string | null
          contact_id?: string
          contact_type: Database["public"]["Enums"]["contact_type"]
          email?: string | null
          employer_id: string
          first_name: string
          landline?: string | null
          last_name: string
          role_title?: string | null
        }
        Update: {
          cellphone?: string | null
          contact_id?: string
          contact_type?: Database["public"]["Enums"]["contact_type"]
          email?: string | null
          employer_id?: string
          first_name?: string
          landline?: string | null
          last_name?: string
          role_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_contacts_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["employer_id"]
          },
        ]
      }
      employers: {
        Row: {
          company_legal_name: string
          created_at: string
          created_by: string | null
          cutoff_days: number | null
          employer_approval_mode: Database["public"]["Enums"]["approval_mode"]
          employer_id: string
          fee_flat_amount: number | null
          fee_percent: number | null
          industry_sector: Database["public"]["Enums"]["industry_sector"] | null
          max_per_pay_period: number | null
          max_per_transaction: number | null
          max_percent_earned: number | null
          onboarding_progress: string | null
          pay_cycle: Database["public"]["Enums"]["pay_cycle"]
          payday: string | null
          payroll_contact_email: string | null
          payroll_contact_first_name: string | null
          payroll_contact_last_name: string | null
          payroll_contact_phone: string | null
          payroll_export_format:
            | Database["public"]["Enums"]["payroll_format"]
            | null
          payroll_period_end: string | null
          payroll_period_start: string | null
          physical_address: string | null
          registration_number: string | null
          settlement_method: string | null
          status: Database["public"]["Enums"]["employer_status"]
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          company_legal_name: string
          created_at?: string
          created_by?: string | null
          cutoff_days?: number | null
          employer_approval_mode?: Database["public"]["Enums"]["approval_mode"]
          employer_id?: string
          fee_flat_amount?: number | null
          fee_percent?: number | null
          industry_sector?:
            | Database["public"]["Enums"]["industry_sector"]
            | null
          max_per_pay_period?: number | null
          max_per_transaction?: number | null
          max_percent_earned?: number | null
          onboarding_progress?: string | null
          pay_cycle: Database["public"]["Enums"]["pay_cycle"]
          payday?: string | null
          payroll_contact_email?: string | null
          payroll_contact_first_name?: string | null
          payroll_contact_last_name?: string | null
          payroll_contact_phone?: string | null
          payroll_export_format?:
            | Database["public"]["Enums"]["payroll_format"]
            | null
          payroll_period_end?: string | null
          payroll_period_start?: string | null
          physical_address?: string | null
          registration_number?: string | null
          settlement_method?: string | null
          status?: Database["public"]["Enums"]["employer_status"]
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          company_legal_name?: string
          created_at?: string
          created_by?: string | null
          cutoff_days?: number | null
          employer_approval_mode?: Database["public"]["Enums"]["approval_mode"]
          employer_id?: string
          fee_flat_amount?: number | null
          fee_percent?: number | null
          industry_sector?:
            | Database["public"]["Enums"]["industry_sector"]
            | null
          max_per_pay_period?: number | null
          max_per_transaction?: number | null
          max_percent_earned?: number | null
          onboarding_progress?: string | null
          pay_cycle?: Database["public"]["Enums"]["pay_cycle"]
          payday?: string | null
          payroll_contact_email?: string | null
          payroll_contact_first_name?: string | null
          payroll_contact_last_name?: string | null
          payroll_contact_phone?: string | null
          payroll_export_format?:
            | Database["public"]["Enums"]["payroll_format"]
            | null
          payroll_period_end?: string | null
          payroll_period_start?: string | null
          physical_address?: string | null
          registration_number?: string | null
          settlement_method?: string | null
          status?: Database["public"]["Enums"]["employer_status"]
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          batch_id: string | null
          failure_reason: string | null
          payout_completed_at: string | null
          payout_failed_at: string | null
          payout_id: string
          payout_initiated_at: string | null
          payout_initiated_by: string | null
          payout_status: Database["public"]["Enums"]["payout_status"]
          request_id: string
          retry_count: number | null
        }
        Insert: {
          batch_id?: string | null
          failure_reason?: string | null
          payout_completed_at?: string | null
          payout_failed_at?: string | null
          payout_id?: string
          payout_initiated_at?: string | null
          payout_initiated_by?: string | null
          payout_status?: Database["public"]["Enums"]["payout_status"]
          request_id: string
          retry_count?: number | null
        }
        Update: {
          batch_id?: string | null
          failure_reason?: string | null
          payout_completed_at?: string | null
          payout_failed_at?: string | null
          payout_id?: string
          payout_initiated_at?: string | null
          payout_initiated_by?: string | null
          payout_status?: Database["public"]["Enums"]["payout_status"]
          request_id?: string
          retry_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id: string
          last_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          amount_requested: number
          amount_to_receive: number | null
          approval_mode_applied:
            | Database["public"]["Enums"]["approval_mode"]
            | null
          approved_at: string | null
          approved_by: string | null
          available_balance_at_request: number | null
          bank_account_masked: string | null
          created_at: string
          decline_reason: string | null
          declined_at: string | null
          declined_by: string | null
          earned_salary_at_request: number | null
          employee_id: string
          employer_id: string
          fee_flat_applied: number | null
          fee_percent_applied: number | null
          request_id: string
          request_status: Database["public"]["Enums"]["request_status"]
          service_fee: number | null
        }
        Insert: {
          amount_requested: number
          amount_to_receive?: number | null
          approval_mode_applied?:
            | Database["public"]["Enums"]["approval_mode"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          available_balance_at_request?: number | null
          bank_account_masked?: string | null
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          earned_salary_at_request?: number | null
          employee_id: string
          employer_id: string
          fee_flat_applied?: number | null
          fee_percent_applied?: number | null
          request_id?: string
          request_status?: Database["public"]["Enums"]["request_status"]
          service_fee?: number | null
        }
        Update: {
          amount_requested?: number
          amount_to_receive?: number | null
          approval_mode_applied?:
            | Database["public"]["Enums"]["approval_mode"]
            | null
          approved_at?: string | null
          approved_by?: string | null
          available_balance_at_request?: number | null
          bank_account_masked?: string | null
          created_at?: string
          decline_reason?: string | null
          declined_at?: string | null
          declined_by?: string | null
          earned_salary_at_request?: number | null
          employee_id?: string
          employer_id?: string
          fee_flat_applied?: number | null
          fee_percent_applied?: number | null
          request_id?: string
          request_status?: Database["public"]["Enums"]["request_status"]
          service_fee?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "requests_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["employer_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          employer_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          employer_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          employer_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["employer_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      account_type: "Cheque" | "Savings" | "Transmission"
      app_role:
        | "owner"
        | "admin"
        | "employer_admin"
        | "supervisor"
        | "hr_approver"
        | "employee"
      approval_mode: "Auto-Approved" | "Supervisor Approval" | "HR Approval"
      audit_action:
        | "employer_created"
        | "employer_activated"
        | "employer_suspended"
        | "employer_terminated"
        | "employee_added"
        | "employee_terminated"
        | "request_submitted"
        | "request_approved"
        | "request_declined"
        | "payout_initiated"
        | "payout_completed"
        | "payout_failed"
        | "payout_retried"
        | "bank_verification_triggered"
        | "login"
        | "logout"
      bank_status: "Pending" | "Verified" | "Failed"
      contact_type: "general" | "authorised_representative"
      employee_status:
        | "Draft"
        | "Pending Invite"
        | "Active"
        | "On Hold"
        | "Terminated"
      employer_status: "Draft" | "Active" | "Suspended" | "Terminated"
      employment_type: "Permanent" | "Contract" | "Part-time" | "Seasonal"
      id_doc_type: "sa_id" | "passport"
      import_source: "Manual" | "Bulk Upload" | "API"
      industry_sector:
        | "Food & Beverage"
        | "Security"
        | "Cleaning"
        | "Retail"
        | "Construction"
        | "Logistics"
        | "Other"
      pay_cycle: "Weekly" | "Bi-weekly" | "Monthly"
      payout_status: "Processing" | "Paid" | "Failed"
      payroll_format:
        | "Standard Lamoola CSV"
        | "Sage Pastel"
        | "VIP Payroll"
        | "SARS EMP201"
        | "Custom CSV"
      request_status: "Pending" | "Approved" | "Declined"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["Cheque", "Savings", "Transmission"],
      app_role: [
        "owner",
        "admin",
        "employer_admin",
        "supervisor",
        "hr_approver",
        "employee",
      ],
      approval_mode: ["Auto-Approved", "Supervisor Approval", "HR Approval"],
      audit_action: [
        "employer_created",
        "employer_activated",
        "employer_suspended",
        "employer_terminated",
        "employee_added",
        "employee_terminated",
        "request_submitted",
        "request_approved",
        "request_declined",
        "payout_initiated",
        "payout_completed",
        "payout_failed",
        "payout_retried",
        "bank_verification_triggered",
        "login",
        "logout",
      ],
      bank_status: ["Pending", "Verified", "Failed"],
      contact_type: ["general", "authorised_representative"],
      employee_status: [
        "Draft",
        "Pending Invite",
        "Active",
        "On Hold",
        "Terminated",
      ],
      employer_status: ["Draft", "Active", "Suspended", "Terminated"],
      employment_type: ["Permanent", "Contract", "Part-time", "Seasonal"],
      id_doc_type: ["sa_id", "passport"],
      import_source: ["Manual", "Bulk Upload", "API"],
      industry_sector: [
        "Food & Beverage",
        "Security",
        "Cleaning",
        "Retail",
        "Construction",
        "Logistics",
        "Other",
      ],
      pay_cycle: ["Weekly", "Bi-weekly", "Monthly"],
      payout_status: ["Processing", "Paid", "Failed"],
      payroll_format: [
        "Standard Lamoola CSV",
        "Sage Pastel",
        "VIP Payroll",
        "SARS EMP201",
        "Custom CSV",
      ],
      request_status: ["Pending", "Approved", "Declined"],
    },
  },
} as const
