import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Slide,
  CircularProgress, // Add this import
} from "@mui/material";
import {
  Warning as WarningIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { forwardRef, useState } from "react";

const DeleteModalTransition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DeleteDialog = ({
  open,
  onClose,
  onDelete,
  title,
  itemToDelete,
  warningText,
}) => {
  // Add loading state
  const [isDeleting, setIsDeleting] = useState(false);

  // Wrap the onDelete handler
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={DeleteModalTransition}
      keepMounted
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          maxWidth: "450px",
        },
      }}
    >
      {/* Custom Header with Warning Icon */}
      <Box
        sx={{
          bgcolor: "error.main",
          color: "error.contrastText",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <WarningIcon sx={{ mr: 1.5, fontSize: "1.75rem" }} />
          <Typography variant="h6" component="h2" fontWeight="bold">
            {title || "Delete Item"}
          </Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CancelIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, pt: 2.5 }}>
        {itemToDelete && (
          <Box sx={{ mb: 2 }}>
            {/* design the text to italic */}
            <Typography
              variant="subtitle1"
              fontStyle="italic"
              color="text.secondary"
              gutterBottom
            >
              Are you sure you want to delete the following item?
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="text.red"
              gutterBottom
            >
              {itemToDelete}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
          </Box>
        )}

        <Box
          sx={{
            mt: 1,
            p: 2,
            bgcolor: "error.lighter",
            borderRadius: 1,
            border: 1,
            borderColor: "error.light",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <ErrorOutlineIcon color="error" sx={{ mr: 1.5, mt: 0.25 }} />
          <Box>
            <Typography
              variant="body2"
              fontWeight="medium"
              color="error.dark"
              gutterBottom
            >
              This action cannot be undone.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {warningText ||
                "Deleting this item will permanently remove all associated data."}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "grey.50",
          borderTop: 1,
          borderColor: "grey.200",
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          startIcon={<CancelIcon />}
          disabled={isDeleting}
          sx={{ borderColor: "grey.400", color: "text.primary" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          startIcon={
            isDeleting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
          disabled={isDeleting}
          sx={{
            px: 2,
            boxShadow: 1,
            "&:hover": {
              bgcolor: "error.dark",
              boxShadow: 2,
            },
          }}
        >
          {isDeleting ? "Deleting..." : "Delete Permanently"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
