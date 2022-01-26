using Microsoft.Azure.Cosmos;
using SmartLockerFunctionApp.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace SmartLockerFunctionApp.Services.LockerManagement
{
    public class LockerService
    {
        private static readonly CosmosClient _cosmosClient = new CosmosClient(Environment.GetEnvironmentVariable("CosmosAdmin"));
        public static readonly Container LockerContainer = _cosmosClient.GetContainer("SmartLocker", "Lockers");
        public static readonly Container DeviceContainer = _cosmosClient.GetContainer("SmartLocker", "Devices");
        public static readonly Container LogContainer = _cosmosClient.GetContainer("SmartLocker", "Logs");

        public static async Task<List<Locker>> GetLockersAsync()
        {
            List<Locker> lockers = new List<Locker>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Lockers");

            FeedIterator<Locker> iterator = LockerContainer.GetItemQueryIterator<Locker>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Locker> response = await iterator.ReadNextAsync();
                lockers.AddRange(response);
            }

            return lockers;
        }

        public static async Task<bool> CheckLockStatusAsync(Guid lockerId)
        {
            var devices = await GetDevicesAsync(lockerId, "lock");
            if (devices.Count <= 0) throw new Exception();

            Log lastLockLog = await GetLastDeviceLogAsync(devices[0].Id);
            if (lastLockLog == null) throw new Exception();

            if (!lastLockLog.Value)
                return false;

            return true;
        }

        public static async Task<bool> CheckMaterialStatusAsync(Guid lockerId)
        {
            var materialStatuses = await GetLockerMaterialStatusAsync(lockerId);

            if (materialStatuses.Contains(false))
                return false;

            return true;
        }

        public static async Task<List<bool>> GetLockerMaterialStatusAsync(Guid lockerId)
        {
            var materialStatuses = new List<bool>();
            var devices = await GetDevicesAsync(lockerId, "sonar");

            foreach (var device in devices)
            {
                var log = await GetLastDeviceLogAsync(device.Id);
                materialStatuses.Add(log.Value);
            }

            return materialStatuses;
        }

        private static async Task<List<Device>> GetDevicesAsync(Guid lockerId, string type)
        {
            List<Device> devices = new List<Device>();
            QueryDefinition query = new QueryDefinition("SELECT * FROM Devices d WHERE d.lockerId = @lockerId and d.type = @type");
            query.WithParameter("@lockerId", lockerId);
            query.WithParameter("@type", type);

            FeedIterator<Device> iterator = DeviceContainer.GetItemQueryIterator<Device>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Device> response = await iterator.ReadNextAsync();
                devices.AddRange(response);
            }

            return devices;
        }

        private static async Task<Log> GetLastDeviceLogAsync(Guid deviceId)
        {
            List<Log> logs = new List<Log>();
            QueryDefinition query = new QueryDefinition("SELECT TOP 1 * FROM Logs l WHERE l.deviceId = @deviceId ORDER BY l._ts DESC");
            query.WithParameter("@deviceId", deviceId);

            FeedIterator<Log> iterator = LogContainer.GetItemQueryIterator<Log>(query);
            while (iterator.HasMoreResults)
            {
                FeedResponse<Log> response = await iterator.ReadNextAsync();
                logs.AddRange(response);
            }

            return logs.Count > 0 ? logs[0] : null;
        }
    }
}
