import type { Issue } from "@fanumtax/core/issue";

import { IssueCard } from "./issue-card";

interface IssueListProps {
  issues: Issue[];
}

export const IssueList: React.FC<IssueListProps> = ({ issues }) => {
  return (
    <div className="grid auto-cols-fr grid-cols-1 gap-4">
      {issues.map((issue) => (
        <IssueCard key={issue.number} issue={issue} />
      ))}
    </div>
  );
};
