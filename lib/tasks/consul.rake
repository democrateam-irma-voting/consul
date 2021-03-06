namespace :consul do
  desc "Runs tasks needed to upgrade to the latest version"
  task execute_release_tasks: ["settings:rename_setting_keys",
                               "settings:add_new_settings",
                               "execute_new_budget_tasks"]

  desc "Runs tasks needed for new budgets"
  task "execute_new_budget_tasks": [
    "budgets:update_drafting_budgets",
    "migrations:add_name_to_existing_budget_phases",
    "migrations:budget_phases_summary_to_description",
    "migrations:migrate_map_location_settings"
  ]

  desc "Runs tasks needed to upgrade from 1.1.0 to 1.2.0"
  task "execute_release_1.2.0_tasks": []
end
