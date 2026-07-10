"""Global Exception Handlers"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from src.exceptions import auth_exceptions
from src.exceptions import candidate_exceptions
from src.exceptions import interview_exceptions
from src.exceptions import job_exceptions
from src.exceptions import user_exceptions

def register_exception_handlers(app):
    """Register all application exception handlers."""

    @app.exception_handler(auth_exceptions.UserNotFoundException)
    async def user_not_found_handler(request: Request, exc:auth_exceptions.UserNotFoundException):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": str(exc)})

    @app.exception_handler(auth_exceptions.InvalidCredentialsException)
    async def invalid_credentials_handler(request: Request, exc: auth_exceptions.InvalidCredentialsException):
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={"message": str(exc)})

    @app.exception_handler(auth_exceptions.InactiveUserException)
    async def inactive_user_handler(request: Request, exc: auth_exceptions.InactiveUserException):
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"message": str(exc)})

    @app.exception_handler(auth_exceptions.InvalidRoleException)
    async def invalid_role_handler(request: Request, exc: auth_exceptions.InvalidRoleException):
        return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"message": str(exc)})

    @app.exception_handler(auth_exceptions.PasswordValidationException)
    async def password_validation_handler(request: Request, exc:auth_exceptions. PasswordValidationException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(user_exceptions.DuplicateEmailException)
    async def duplicate_email_exception_handler(request: Request, exc: user_exceptions.DuplicateEmailException):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": str(exc)})
    
    @app.exception_handler(user_exceptions.InvalidEmailDomainException)
    async def invalid_email_domain_exception_handler(request: Request, exc: user_exceptions.InvalidEmailDomainException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})
    
    @app.exception_handler(user_exceptions.UserAlreadyInactiveException)
    async def user_already_inactive_exception_handler(request: Request, exc: user_exceptions.UserAlreadyInactiveException):
        return JSONResponse(status_code= status.HTTP_409_CONFLICT, content= {"message": str(exc)})
    
    @app.exception_handler(user_exceptions.UserAlreadyActiveException)
    async def user_already_active_exception_handler(request, exc):
        return JSONResponse(status_code=400, content={"success": False, "message": str(exc)})

    @app.exception_handler(job_exceptions.JobNotFoundException)
    async def job_not_found_handler(request: Request, exc: job_exceptions.JobNotFoundException):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": str(exc)})

    @app.exception_handler(job_exceptions.DuplicateJobTitleException)
    async def duplicate_job_title_handler(request: Request, exc: job_exceptions.DuplicateJobTitleException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.CandidateNotFoundException)
    async def candidate_not_found_handler(request: Request, exc: candidate_exceptions.CandidateNotFoundException):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.AppliedJobNotFoundException)
    async def applied_job_not_found_handler(request: Request, exc: candidate_exceptions.AppliedJobNotFoundException):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.CandidateEmailAlreadyExistsException)
    async def candidate_email_exists_handler(request: Request, exc: candidate_exceptions.CandidateEmailAlreadyExistsException):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.CandidateMobileAlreadyExistsException)
    async def candidate_mobile_exists_handler(request: Request, exc: candidate_exceptions.CandidateMobileAlreadyExistsException):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.InvalidNucleusTeqEmailException)
    async def invalid_nucleusteq_email_handler(request: Request, exc: candidate_exceptions.InvalidNucleusTeqEmailException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.ResumeNotFoundException)
    async def resume_not_found_handler(request: Request, exc: candidate_exceptions.ResumeNotFoundException):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.InvalidFileTypeException)
    async def invalid_file_type_handler(request: Request, exc: candidate_exceptions.InvalidFileTypeException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.EmptyFileException)
    async def empty_file_handler(request: Request, exc: candidate_exceptions.EmptyFileException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.ResumeUploadFailedException)
    async def resume_upload_failed_handler(request: Request, exc: candidate_exceptions.ResumeUploadFailedException):
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"message": str(exc)})

    @app.exception_handler(candidate_exceptions.InvalidCandidateStatusException)
    async def invalid_candidate_status_handler(request: Request, exc: candidate_exceptions.InvalidCandidateStatusException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.InterviewNotFoundException)
    async def interview_not_found_handler(request: Request, exc: interview_exceptions.InterviewNotFoundException):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.FeedbackAlreadySubmittedException)
    async def feedback_already_submitted_handler(request: Request, exc: interview_exceptions.FeedbackAlreadySubmittedException):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.InvalidInterviewerException)
    async def invalid_interviewer_handler(request: Request, exc: interview_exceptions.InvalidInterviewerException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.InvalidInterviewDateException)
    async def invalid_interview_date_handler(request: Request, exc: interview_exceptions.InvalidInterviewDateException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.MeetingLinkRequiredException)
    async def meeting_link_required_handler(request: Request, exc: interview_exceptions.MeetingLinkRequiredException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.LocationRequiredException)
    async def location_required_handler(request: Request, exc: interview_exceptions.LocationRequiredException,):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.FeedbackNotYetAllowedException)
    async def feedback_not_yet_allowed_handler(request: Request, exc: interview_exceptions.FeedbackNotYetAllowedException):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"message": str(exc)})

    @app.exception_handler(interview_exceptions.InterviewAlreadyCompletedException)
    async def interview_already_completed_handler(request: Request, exc: interview_exceptions.InterviewAlreadyCompletedException):
        return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"message": str(exc)})