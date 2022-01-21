using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;

namespace SmartLockerFunctionApp.Services.LockerManagement
{
    public static class LockerManagementService
    {
        public static async Task<bool> ValidateStartRegistrationAsync(Registration registration )
        {
            // Check for open registration
            var currentRegistration = await RegistrationService.GetCurrentRegistrationAsync(registration.LockerId);
            if (currentRegistration != null) return false;

            // Check for open reservation
            var currentReservation = await ReservationService.GetCurrentOrNextReservationAsync(registration.LockerId);
            if (currentReservation.StartTime < DateTime.Now) return false;

            return true;
        }

        public static async Task<bool> ValidateEndRegistrationAsync(Registration registration)
        {
            // Check for open registration
            var currentRegistration = await RegistrationService.GetCurrentRegistrationAsync(registration.LockerId);
            if (currentRegistration == null) return false;
            if (currentRegistration.Id != registration.Id) return false;

            return true;
        }

        public static async Task<bool> ValidateReservationAsync(Reservation reservation)
        {
            if (reservation.StartTime > reservation.EndTime || reservation.EndTime < DateTime.Now)
                return false;

            // Check current registration

            var reservations = await ReservationService.GetReservationsAsync(reservation.LockerId);
            foreach (var validReservation in reservations)
            {
                if (reservation.StartTime < validReservation.EndTime)
                {
                    if (reservation.EndTime > validReservation.StartTime)
                        return false;
                    else
                        break;
                }
            }

            return true;
        }

        public static async Task<bool> CheckRegistrationAsync(Guid lockerId, string userId)
        {
            var currentUserRegistration = await RegistrationService.GetCurrentRegistrationAsync(lockerId, userId);

            if (currentUserRegistration == null)
                return false;

            return true;
        }

        
    }
}
