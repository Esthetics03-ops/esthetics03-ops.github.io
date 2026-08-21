import os
import json
from google.cloud import bigquery

def load_data_to_bigquery(json_file_path, table_id):
    """
    Loads JSON data into BigQuery.
    """
    client = bigquery.Client()
    
    # Configure the load job
    job_config = bigquery.LoadJobConfig(
        source_format=bigquery.SourceFormat.NEWLINE_DELIMITED_JSON,
        write_disposition=bigquery.WriteDisposition.WRITE_APPEND, # Adds new data
    )

    with open(json_file_path, "rb") as source_file:
        job = client.load_table_from_file(source_file, table_id, job_config=job_config)

    job.result()  # Wait for the job to complete
    print(f"Loaded {job.output_rows} rows into {table_id}.")

if __name__ == "__main__":
    # Ensure these are set in your GitHub Secrets
    PROJECT_ID = os.getenv("GCP_PROJECT_ID")
    DATASET_ID = "esthetics_hub_data"
    
    # 1. Process GBP Data
    gbp_table = f"{PROJECT_ID}.{DATASET_ID}.gbp_performance"
    if os.path.exists('gbp_data.json'):
        load_data_to_bigquery('gbp_data.json', gbp_table)
    
    # 2. Process Spreadsheet Data (Assumes you have a converted JSON file)
    # revenue_table = f"{PROJECT_ID}.{DATASET_ID}.revenue_logs"
    # if os.path.exists('revenue_data.json'):
    #     load_data_to_bigquery('revenue_data.json', revenue_table)

    print("Pipeline orchestration complete.")
