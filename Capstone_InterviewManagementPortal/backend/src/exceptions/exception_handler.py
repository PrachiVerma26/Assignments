"""Global Exception Handlers"""

from fastapi import (Request,status)
from fastapi.responses import JSONResponse
from src.exceptions.auth_exceptions import (UserNotFoundException, InvalidCredentialsException, InactiveUserException, InvalidRoleException, PasswordValidationException)
from src.exceptions.user_exceptions import DuplicateEmailException, InvalidEmailDomainException, UserAlreadyInactiveException, UserAlreadyActiveException
from src.exceptions.job_exceptions import JobNotFoundException, DuplicateJobTitleException
from src.exceptions.candidate_exceptions import CandidateNotFoundException, CandidateEmailAlreadyExistsException, CandidateMobileAlreadyExistsException, InvalidNucleusTeqEmailException

def register_exception_handlers(app):
    """ Register all application exception handlers."""

    @app.exception_handler(UserNotFoundException)
    async def user_not_found_handler(request: Request, exc: UserNotFoundException):

        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={ "message": str(exc)}
        )

    @app.exception_handler(InvalidCredentialsException)
    async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsException):

        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"message": str(exc)}
        )

    @app.exception_handler(InactiveUserException)
    async def inactive_user_handler(request: Request, exc: InactiveUserException):

        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": str(exc)}
        )

    @app.exception_handler(InvalidRoleException)
    async def invalid_role_handler(request: Request, exc: InvalidRoleException):

        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={"message": str(exc)}
        )

    @app.exception_handler(PasswordValidationException)
    async def password_validation_handler(request: Request, exc: PasswordValidationException):

        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(exc)}
        )
    
    @app.exception_handler(DuplicateEmailException)
    async def duplicate_email_exception_handler(request: Request, exc: DuplicateEmailException):

        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"message": str(exc)}
        )
    
    @app.exception_handler(InvalidEmailDomainException)
    async def invalid_email_domain_exception_handler(request: Request, exc: InvalidEmailDomainException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(exc)},
        )
    
    @app.exception_handler(UserAlreadyInactiveException)
    async def user_already_inactive_exception_handler(request: Request, exc: UserAlreadyInactiveException):
        return JSONResponse(
            status_code= status.HTTP_409_CONFLICT, 
            content= {"message": str(exc)}
        )
    
    @app.exception_handler(UserAlreadyActiveException)
    async def user_already_active_exception_handler(request, exc):
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(exc) }
        )
    
    @app.exception_handler(JobNotFoundException)
    async def job_not_found_handler(request: Request, exc: JobNotFoundException):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": str(exc)}
        )
    
    @app.exception_handler(DuplicateJobTitleException)
    async def duplicate_job_title_handler(request: Request, exc: DuplicateJobTitleException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(exc)}
        )

    @app.exception_handler(CandidateNotFoundException)
    async def candidate_not_found_handler(request: Request, exc: CandidateNotFoundException):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": str(exc)}
        )

    @app.exception_handler(CandidateEmailAlreadyExistsException)
    async def candidate_email_exists_handler(request: Request, exc: CandidateEmailAlreadyExistsException):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"message": str(exc)}
        )

    @app.exception_handler(CandidateMobileAlreadyExistsException)
    async def candidate_mobile_exists_handler(request: Request, exc: CandidateMobileAlreadyExistsException):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"message": str(exc)}
        )

    @app.exception_handler(InvalidNucleusTeqEmailException)
    async def invalid_nucleusteq_email_handler(request: Request, exc: InvalidNucleusTeqEmailException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": str(exc)}
        )