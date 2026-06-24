"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useDsrViewModel } from "../viewmodels/useDsrViewModel";
import { SubmitDsrModal } from "../components/SubmitDsrModal";
import { ReviewDsrModal } from "../components/ReviewDsrModal";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";

/**
 * React presentation component representing the dsr view UI element.
 */
export function DsrView() {
  useModuleLocales(() => import("../../../locales"), "compliance-dsr");

  const {
    vm,
    getConfigBase,
    t,
    submitOpen,
    setSubmitOpen,
    handleSubmit,
    isSubmitting,
    reviewDsr,
    setReviewDsr,
    handleReview,
    isReviewing,
  } = useDsrViewModel();

  const config = useMemo(
    (): CrudConfig<DataSubjectRequest> => {
      const base = getConfigBase();
      return {
        titleKey: "compliance.dsrTitle",
        subtitleKey: "compliance.noDsrsDesc",
        resource: "compliance",
        columns: base.columns ?? [],
        ...base,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, getConfigBase]
  );

  return (
    <>
      <GenericCrudView<DataSubjectRequest> config={config} viewModel={vm} />

      <SubmitDsrModal
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ReviewDsrModal
        dsr={reviewDsr}
        open={reviewDsr !== null}
        onOpenChange={(v) => {
          if (!v) setReviewDsr(null);
        }}
        onReview={handleReview}
        isReviewing={isReviewing}
      />
    </>
  );
}
