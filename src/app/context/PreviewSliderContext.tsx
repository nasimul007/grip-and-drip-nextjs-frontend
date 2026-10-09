"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  /** Index of the image the preview should open on. */
  startIndex: number;
  openPreviewModal: (index?: number) => void;
  closePreviewModal: () => void;
}

const PreviewSlider = createContext<PreviewSliderType | undefined>(undefined);

export const usePreviewSlider = () => {
  const context = useContext(PreviewSlider);
  if (!context) {
    throw new Error("usePreviewSlider must be used within a ModalProvider");
  }
  return context;
};

export const PreviewSliderProvider = ({ children }) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openPreviewModal = useCallback((index = 0) => {
    setStartIndex(index);
    setIsModalOpen(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isModalPreviewOpen, startIndex, openPreviewModal, closePreviewModal }),
    [isModalPreviewOpen, startIndex, openPreviewModal, closePreviewModal]
  );

  return (
    <PreviewSlider.Provider value={value}>
      {children}
    </PreviewSlider.Provider>
  );
};
