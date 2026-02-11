"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";

export function MemoRejectModal({
  isOpen,
  onClose,
  rejectReason,
  onReasonChange,
  onConfirm,
  isLoading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Specify Rejection Reason</ModalHeader>
        <ModalBody>
          <Textarea
            placeholder="Please specify the reason for rejection..."
            value={rejectReason}
            onChange={(e) => onReasonChange(e.target.value)}
            minRows={3}
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button
            color="danger"
            onPress={onConfirm}
            isDisabled={!rejectReason.trim()}
            isLoading={isLoading}
          >
            Reject
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default MemoRejectModal;
