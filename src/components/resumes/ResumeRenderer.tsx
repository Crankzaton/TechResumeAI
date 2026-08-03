import type { ResumeData } from "@/lib/types";
import { ServiceNowResume } from "./ServiceNowResume";
import { SalesforceResume } from "./SalesforceResume";
import { AwsResume } from "./AwsResume";
import { AzureResume } from "./AzureResume";

export function ResumeRenderer({ data }: { data: ResumeData }) {
  switch (data.theme) {
    case "salesforce":
      return <SalesforceResume data={data} />;
    case "aws":
      return <AwsResume data={data} />;
    case "azure":
      return <AzureResume data={data} />;
    case "servicenow":
    default:
      return <ServiceNowResume data={data} />;
  }
}
