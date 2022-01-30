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
        public static async Task<bool> ValidateReservationAsync(Reservation reservation, DateTime startThreshold)
        {
            if (reservation.StartTime > reservation.EndTime || reservation.StartTime < startThreshold)
                return false;

            var reservations = await ReservationService.GetReservationsNewAsync(reservation.LockerId);
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

        public static async Task<bool> ValidateEndRegistrationAsync(Registration registration)
        {
            // Check for open registration
            var currentRegistration = await RegistrationService.GetCurrentRegistrationAsync(registration.LockerId);
            if (currentRegistration == null) return false;
            if (currentRegistration.Id != registration.Id) return false;

            return true;
        }

        public static async Task<bool> CheckRegistrationAsync(Guid lockerId, string userId)
        {
            var currentUserRegistration = await RegistrationService.GetCurrentRegistrationAsync(lockerId, userId);

            if (currentUserRegistration == null)
                return false;

            return true;
        }

        public static async Task<Locker> UpdateLockerStatusAsync(Locker locker) 
        {
            if (locker.Status != "Buiten gebruik")
            {
                var reservations = await ReservationService.GetReservationsNewAsync(locker.Id);
                if (reservations.Count > 0 && reservations[0].StartTime < DateTime.Now)
                    locker.Status = "Bezet";
                else
                    locker.Status = "Beschikbaar";
            }

            return locker;
        }
    }
}
