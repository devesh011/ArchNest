import { useEffect, useState } from "react";
import { getMonthlyUsage, getAppStorageUsage } from "../../lib/puter.action";

const UsageWidget = () => {
  const [usage, setUsage] = useState<any>(null);
  const [storage, setStorage] = useState<{
    bytes: number;
    fileCount: number;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      const [m, s] = await Promise.all([
        getMonthlyUsage(),
        getAppStorageUsage(),
      ]);
      setUsage(m);
      setStorage(s);
    };
    load();
  }, []);

  if (!usage || !storage) return null;

  const resourcesUsed = usage.usage?.total ?? 0;
  const resourcesLimit = usage.allowanceInfo?.monthUsageAllowance ?? 1;
  const resourcesPercent = Math.min(
    100,
    (resourcesUsed / resourcesLimit) * 100,
  );

  return (
    <div className="usage-widget">
      <span className="usage-eyebrow">// usage</span>

      <div style={{ marginTop: "10px" }}>
        <div className="usage-bar-row">
          <span>Storage (ArchNest)</span>
          <span>
            {(storage.bytes / 1024 / 1024).toFixed(2)} MB · {storage.fileCount}{" "}
            files
          </span>
        </div>
      </div>

      <div style={{ marginTop: "12px" }}>
        <div className="usage-bar-row">
          <span>Resources</span>
          <span>
            ${(resourcesUsed / 1e8).toFixed(2)} of $
            {(resourcesLimit / 1e8).toFixed(2)}
          </span>
        </div>
        <div className="usage-bar">
          <div
            className="usage-bar-fill"
            style={{ width: `${resourcesPercent}%`, background: "#EF9F27" }}
          />
        </div>
      </div>
    </div>
  );
};
export default UsageWidget;
