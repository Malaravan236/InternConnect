from django.urls import path
from . import views

urlpatterns = [
    path("auth/register/", views.register),
    path("auth/login/", views.login),
    path("auth/me/", views.me),
    path("auth/send-verification/", views.send_verification),
    path("auth/verify/<str:token>/", views.verify_email),
    path("auth/password-reset/", views.password_reset_request),
    path("auth/password-reset/confirm/", views.password_reset_confirm),
    path("db/<str:coll>/", views.collection_view),
    path("db/<str:coll>/<str:doc_id>/", views.document_view),
    path("files/upload/", views.upload_file),
    path("files/<str:name>", views.serve_file),
    path("email/acceptance/", views.send_acceptance_email),
]
